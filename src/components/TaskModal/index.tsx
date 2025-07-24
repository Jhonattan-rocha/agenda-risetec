// src/components/TaskModal/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../Common';
import type { Calendar, Profile, Task, User } from '../../types';
import { format, parseISO } from 'date-fns';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import api from '../../services/axios';
import ActivityIndicator from '../ActivityIndicator';
import { CheckboxGroup, ColorPickerContainer, ColorSwatch, FormGroup, Input, Label, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, 
  Select, TextArea, TimeInputs, UserCheckboxItem, UserSelectorContainer
 } from './styled';
import styled from 'styled-components';
import { usePermission } from '../../hooks/usePermission';
import RecurrenceModal from '../RecurrenceModal';
import { rrulestr } from 'rrule';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  initialDate?: Date;
}

const CustomColorInput = styled.input.attrs({ type: 'color' })`
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: transparent;
  padding: 0;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }
`;

const predefinedColors = [
  '#FFDDC1', '#D4E8D4', '#C7CEEA', '#F0E68C', '#AED6F1', '#FFC0CB', '#AFEEEE', '#E6E6FA',
];

// NOVO: Adicionando um container para agrupar campos lado a lado
const FormRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  
  & > * {
    flex: 1;
  }
`;

const RecurrenceButton = styled(Button).attrs({ type: 'button', outline: true })`
    justify-content: flex-start;
    text-align: left;
    width: 100%;
    color: ${({ theme }) => theme.colors.textPrimary};
`;

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, initialDate }) => {
  // ATUALIZADO: Estado inicial com os novos campos
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    date: initialDate || new Date(),
    endDate: undefined,
    isAllDay: false,
    startTime: '',
    endTime: '',
    color: predefinedColors[0],
    calendar_id: '',
    users: [],
    location: '', 
    status: 'confirmed', 
    recurring_rule: '', 
  });
  const [users, setUsers] = useState<Array<User>>([]);
  const [calendars, setCalendars] = useState<Array<Calendar>>([]);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const isEditing = !!task;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const calendarIdForPermission = currentTask.calendar_id || task?.calendar_id;
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false); // Estado para o novo modal

  const canCreateTask = usePermission('create', `calendar_${calendarIdForPermission}`, user.user.profile as Profile);
  const canUpdateTask = usePermission('update', `calendar_${calendarIdForPermission}`, user.user.profile as Profile);
  const canDeleteTask = usePermission('delete', `calendar_${calendarIdForPermission}`, user.user.profile as Profile);
  
  const canSave = isEditing ? canUpdateTask : canCreateTask;
  const isCustomColor = !predefinedColors.includes(currentTask.color || '');

  useEffect(() => {
    if (task) {
      setCurrentTask({
        ...task,
        date: task.date instanceof Date ? task.date : parseISO(new Date(task.date).toISOString()),
        endDate: task.endDate ? (task.endDate instanceof Date ? task.endDate : parseISO(new Date(task.endDate).toISOString())) : task.date ? task.date : undefined,
        startTime: task.startTime || '',
        endTime: task.endTime || '',
        users: task.users || [],
        location: task.location || '',
        status: task.status || 'confirmed',
        recurring_rule: task.recurring_rule || '',
      });
    } else {
      setCurrentTask({
        title: '',
        description: '',
        date: initialDate || new Date(),
        endDate: initialDate || new Date(),
        isAllDay: false,
        startTime: '',
        endTime: '',
        color: predefinedColors[0],
        calendar_id: '',
        users: [],
        location: '',
        status: 'confirmed',
        recurring_rule: '',
      });
    }
  }, [task, initialDate]);

  const handleUserChange = (userId: string) => {
    setCurrentTask(prev => {
      const selectedUsers = prev.users || [];
      const userIndex = selectedUsers.findIndex(u => u.id === userId);
      const userToToggle = users.find(u => u.id === userId);

      if (!userToToggle) return prev;

      if (userIndex > -1) {
        return { ...prev, users: selectedUsers.filter(u => u.id !== userId) };
      } else {
        return { ...prev, users: [...selectedUsers, userToToggle] };
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setCurrentTask(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'isAllDay' && checked) {
      setCurrentTask(prev => ({ ...prev, startTime: '', endTime: '' }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const dateValue = value ? new Date(value + 'T12:00:00') : undefined;
    setCurrentTask(prev => ({ ...prev, [name]: dateValue }));
  };

  const handleSave = () => {
    if (!currentTask.title || !currentTask.date || !currentTask.calendar_id) {
      alert('Título, Data de Início e Calendário são obrigatórios.');
      return;
    }
    setIsLoading(true);

    const user_ids = currentTask.users?.map(user => parseInt(user.id, 10)) || [];

    // CORREÇÃO: Usar o ID original para o payload, mas manter o ID da ocorrência se não houver original
    const eventIdForPayload = currentTask.originalId || currentTask.id;

    const taskPayload = {
      id: eventIdForPayload, // Envia o ID original no corpo
      title: currentTask.title,
      description: currentTask.description,
      date: currentTask.date,
      endDate: currentTask.endDate,
      isAllDay: currentTask.isAllDay,
      startTime: currentTask.startTime,
      endTime: currentTask.endTime,
      color: currentTask.color,
      calendar_id: parseInt(String(currentTask.calendar_id), 10),
      user_ids: user_ids,
      location: currentTask.location,
      status: currentTask.status,
      recurring_rule: currentTask.recurring_rule,
    };

    // CORREÇÃO: Usa o ID original na URL para PUT, e a rota padrão para POST
    const url = isEditing ? `/event/${eventIdForPayload}` : "/event";
    const method = isEditing ? 'put' : 'post';

    const req = api[method](url, taskPayload, { headers: { Authorization: `Bearer ${user.token}` }});
    
    req.then(() => {
      setIsLoading(false);
      onClose();
    }).catch(err => {
      console.log(err);
      setIsLoading(false);
    });
  };

  const handleDelete = () => {
    // CORREÇÃO: Usa o ID original para a deleção
    const eventIdToDelete = task?.originalId || task?.id;
    if (eventIdToDelete && window.confirm('Tem certeza que deseja excluir esta tarefa e todas as suas repetições?')) {
      setIsLoading(true);
      api.delete(`/event/${eventIdToDelete}`, { headers: { Authorization: `Bearer ${user.token}` }})
      .then(() => {
        setIsLoading(false);
        onClose();
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
      });
    }
  };
  
  const fetchAllData = useCallback(async () => {
    try {
        const [usersRes, calendarsRes] = await Promise.all([
            api.get("/user", { headers: { Authorization: `Bearer ${user.token}` }}),
            api.get("/calendar", { headers: { Authorization: `Bearer ${user.token}` }})
        ]);
        setUsers(usersRes.data as User[]);
        setCalendars(calendarsRes.data as Calendar[]);
    } catch (err) {
        console.log(err);
    }
  }, [user.token]);


  useEffect(() => {
    if(isOpen) {
        fetchAllData();
    }
  }, [isOpen, fetchAllData]);

  const getRecurrenceSummary = (rruleString?: string): string => {
    if (!rruleString) {
        return 'Nunca';
    }
    try {
        // A biblioteca rrule tem uma tradução para pt, mas vamos usar o da lib date-fns para consistencia
        return rrulestr(rruleString).toText();
    } catch {
        return 'Personalizado';
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{isEditing ? 'Editar Tarefa' : 'Criar Tarefa'}</h2>
          <button onClick={onClose}>&times;</button>
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" value={currentTask.title || ''} onChange={handleChange} required />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="location">Localização</Label>
            <Input id="location" name="location" value={currentTask.location || ''} onChange={handleChange} placeholder="Ex: Sala de Reuniões 3" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Descrição</Label>
            <TextArea id="description" name="description" value={currentTask.description || ''} onChange={handleChange} />
          </FormGroup>
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="date">Data de Início</Label>
              <Input id="date" name="date" type="date" value={currentTask.date ? format(currentTask.date, 'yyyy-MM-dd') : ''} onChange={handleDateChange} required />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="endDate">Data Final</Label>
                <Input id="endDate" name="endDate" type="date" value={currentTask.endDate ? format(currentTask.endDate, 'yyyy-MM-dd') : ''} onChange={handleDateChange} />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" value={currentTask.status} onChange={handleChange}>
                <option value="confirmed">Confirmado</option>
                <option value="tentative">Pendente</option>
                <option value="cancelled">Cancelado</option>
              </Select>
            </FormGroup>
            
              {/* SUBSTITUI O SELECT ANTIGO */}
              <FormGroup>
                <Label>Repetir</Label>
                <RecurrenceButton onClick={() => setIsRecurrenceModalOpen(true)}>
                    {getRecurrenceSummary(currentTask.recurring_rule)}
                </RecurrenceButton>
              </FormGroup>
          </FormRow>

          <CheckboxGroup>
            <Input id="isAllDay" name="isAllDay" type="checkbox" checked={currentTask.isAllDay || false} onChange={handleChange} />
            <Label htmlFor="isAllDay">Dia todo</Label>
          </CheckboxGroup>

          {!currentTask.isAllDay && (
            <TimeInputs>
              <FormGroup><Label htmlFor="startTime">Início</Label><Input id="startTime" name="startTime" type="time" value={currentTask.startTime || ''} onChange={handleChange} /></FormGroup>
              <FormGroup><Label htmlFor="endTime">Fim</Label><Input id="endTime" name="endTime" type="time" value={currentTask.endTime || ''} onChange={handleChange} /></FormGroup>
            </TimeInputs>
          )}

          <FormGroup>
            <Label>Participantes</Label>
            <UserSelectorContainer>
              {users.map(u => (
                <UserCheckboxItem key={u.id}>
                  <input type="checkbox" id={`user-${u.id}`} checked={currentTask.users?.some(selectedUser => selectedUser.id === u.id) || false} onChange={() => handleUserChange(u.id)} />
                  <label htmlFor={`user-${u.id}`}>{u.name}</label>
                </UserCheckboxItem>
              ))}
            </UserSelectorContainer>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="calendar_id">Calendário</Label>
            <Select id="calendar_id" name="calendar_id" value={currentTask.calendar_id || ''} onChange={handleChange} required >
              <option value="" disabled>Selecione um calendário</option>
              {calendars.map(calendar => (
                <option key={calendar.id} value={calendar.id}>{calendar.name}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Cor</Label>
            <ColorPickerContainer>
              {predefinedColors.map(color => (
                <ColorSwatch
                  key={color}
                  $color={color}
                  $isSelected={currentTask.color === color}
                  onClick={() => setCurrentTask(prev => ({ ...prev, color }))}
                />
              ))}
              <ColorSwatch $color={isCustomColor ? currentTask.color! : '#ccc'} $isSelected={isCustomColor}>
                <CustomColorInput
                  name="color"
                  value={currentTask.color || '#ffffff'}
                  onChange={handleChange}
                />
              </ColorSwatch>
            </ColorPickerContainer>
          </FormGroup>
        </ModalBody>
        <ModalFooter $isEditing={isEditing}>
          {isEditing && !isLoading && canDeleteTask && (
            <Button danger onClick={handleDelete}>Excluir</Button>
          )}
          <div>
            {isLoading ? (<ActivityIndicator />) : (
              <>
                <Button outline onClick={onClose}>Cancelar</Button>
                {canSave && (
                  <Button primary onClick={handleSave}>
                    {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
                  </Button>
                )}
              </>
            )}
          </div>
        </ModalFooter>
      </ModalContent>

      {/* Renderiza o novo modal de recorrência */}
      <RecurrenceModal
        isOpen={isRecurrenceModalOpen}
        onClose={() => setIsRecurrenceModalOpen(false)}
        onSave={(rule) => setCurrentTask(prev => ({ ...prev, recurring_rule: rule }))}
        initialRRule={currentTask.recurring_rule}
        startDate={currentTask.date || new Date()}
      />
    </ModalOverlay>
  );
};

export default TaskModal;
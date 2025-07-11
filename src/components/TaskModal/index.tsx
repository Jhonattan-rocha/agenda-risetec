// src/components/TaskModal/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../Common';
import type { Calendar, Profile, Task, User } from '../../types';
import { format, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import api from '../../services/axios';
import ActivityIndicator from '../ActivityIndicator';
import { CheckboxGroup, ColorPickerContainer, ColorSwatch, FormGroup, Input, Label, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, 
  Select, TextArea, TimeInputs, UserCheckboxItem, UserSelectorContainer
 } from './styled';
import styled from 'styled-components';
import { usePermission } from '../../hooks/usePermission';

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

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, initialDate }) => {
  // ATUALIZADO: Estado inicial com os novos campos
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    date: initialDate || new Date(),
    isAllDay: false,
    startTime: '',
    endTime: '',
    color: predefinedColors[0],
    calendar_id: '',
    users: [],
    location: '', // NOVO
    status: 'confirmed', // NOVO
    recurring_rule: '', // NOVO
  });
  const [users, setUsers] = useState<Array<User>>([]);
  const [calendars, setCalendars] = useState<Array<Calendar>>([]);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const isEditing = !!task;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const calendarIdForPermission = currentTask.calendar_id || task?.calendar_id;

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
        startTime: task.startTime || '',
        endTime: task.endTime || '',
        users: task.users || [],
        // ATUALIZADO: Garante que os novos campos sejam populados ao editar
        location: task.location || '',
        status: task.status || 'confirmed',
        recurring_rule: task.recurring_rule || '',
      });
    } else {
      setCurrentTask({
        title: '',
        description: '',
        date: initialDate || new Date(),
        isAllDay: false,
        startTime: '',
        endTime: '',
        color: predefinedColors[0],
        calendar_id: '',
        users: [],
        // ATUALIZADO: Campos novos no estado inicial
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
    const dateString = e.target.value;
    setCurrentTask(prev => ({ ...prev, date: new Date(dateString + 'T12:00:00') }));
  };

  const handleSave = () => {
    if (!currentTask.title || !currentTask.date || !currentTask.calendar_id) {
      alert('Título, Data e Calendário são obrigatórios.');
      return;
    }
    setIsLoading(true);

    const user_ids = currentTask.users?.map(user => parseInt(user.id, 10)) || [];

    // ATUALIZADO: Payload inclui os novos campos
    const taskPayload = {
      id: currentTask.id || uuidv4(),
      title: currentTask.title,
      description: currentTask.description,
      date: currentTask.date,
      isAllDay: currentTask.isAllDay,
      startTime: currentTask.startTime,
      endTime: currentTask.endTime,
      color: currentTask.color,
      calendar_id: parseInt(String(currentTask.calendar_id), 10),
      user_ids: user_ids,
      location: currentTask.location, // NOVO
      status: currentTask.status, // NOVO
      recurring_rule: currentTask.recurring_rule, // NOVO
    };

    const req = isEditing 
      ? api.put(`/event/${taskPayload.id}`, taskPayload, { headers: { Authorization: `Bearer ${user.token}` }})
      : api.post("/event", taskPayload, { headers: { Authorization: `Bearer ${user.token}` }});
    
    req.then(() => {
      setIsLoading(false);
      onClose();
    }).catch(err => {
      console.log(err);
      setIsLoading(false);
    });
  };

  const handleDelete = () => {
    if (task?.id && window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setIsLoading(true);
      api.delete(`/event/${task.id}`, { headers: { Authorization: `Bearer ${user.token}` }})
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

          {/* NOVO: Campo de Localização */}
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
              <Label htmlFor="date">Data</Label>
              <Input id="date" name="date" type="date" value={currentTask.date ? format(currentTask.date, 'yyyy-MM-dd') : ''} onChange={handleDateChange} required />
            </FormGroup>

            {/* NOVO: Campo de Status */}
            <FormGroup>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" value={currentTask.status} onChange={handleChange}>
                <option value="confirmed">Confirmado</option>
                <option value="tentative">Pendente</option>
                <option value="cancelled">Cancelado</option>
              </Select>
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
    </ModalOverlay>
  );
};

export default TaskModal;
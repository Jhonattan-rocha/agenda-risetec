/* eslint-disable no-useless-escape */
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
import type { RecurrenceEditChoice } from '../RecurrenceEditChoiceModal'; // Importar o tipo
import { getText } from '../../utils/dateUtils';
import { convertToMinutes, convertFromMinutes, type TimeUnit } from '../../utils/timeConverter'; // NOVO

// --- NOVO: Estilo para exibir as mensagens de erro ---
const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
  margin-top: 4px;
`;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  initialDate?: Date;
  editMode: RecurrenceEditChoice; // Prop para saber como editar
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

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, initialDate, editMode }) => {
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);
  const [users, setUsers] = useState<Array<User>>([]);
  const [calendars, setCalendars] = useState<Array<Calendar>>([]);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const isEditing = !!task;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const calendarIdForPermission = currentTask.calendar_id || task?.calendar_id;
  
  // --- NOVO: Estado para os erros de validação ---
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canCreateTask = usePermission('create', `calendar_${calendarIdForPermission}`, user.user.profile as Profile);
  const canUpdateTask = usePermission('update', `calendar_${calendarIdForPermission}`, user.user.profile as Profile);
  const canDeleteTask = usePermission('delete', `calendar_${calendarIdForPermission}`, user.user.profile as Profile);
  
  const canSave = isEditing ? canUpdateTask : canCreateTask;
  const isCustomColor = !predefinedColors.includes(currentTask.color || '');
  const [timeValue, setTimeValue] = useState<string>('');
  const [timeUnit, setTimeUnit] = useState<TimeUnit | ''>('');

  useEffect(() => {
    const taskToLoad: Task = task as Task;
    if (taskToLoad?.notification_time_before != null) {
        const [value, unit] = convertFromMinutes(taskToLoad.notification_time_before);
        setTimeValue(String(value));
        setTimeUnit(unit);
    } else {
        setTimeValue('');
        setTimeUnit('');
    }
    setCurrentTask({
      ...taskToLoad,
      date: task ? (task.date instanceof Date ? task.date : parseISO(new Date(task.date).toISOString())) : (initialDate || new Date()),
      endDate: task?.endDate ? (task.endDate instanceof Date ? task.endDate : parseISO(new Date(task.endDate).toISOString())) : undefined,
      recurring_rule: task?.recurring_rule || '',
      color: task ? task.color : undefined, 
    });
    // Limpa os erros ao abrir o modal
    setErrors({});
  }, [task, initialDate, isOpen]);

  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
              onClose();
          }
      };
      if (isOpen) {
          document.addEventListener('keydown', handleKeyDown);
      }
      return () => {
          document.removeEventListener('keydown', handleKeyDown);
      };
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
    const checked = (e.target as HTMLInputElement).checked;
    setCurrentTask(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
    const dateValue = value ? new Date(value + 'T12:00:00') : undefined;
    setCurrentTask(prev => ({ ...prev, [name]: dateValue }));
  };

  const handleUserChange = (userId: string) => {
    setCurrentTask(prev => {
        const selectedUsers = prev.users || [];
        const userToToggle = users.find(u => u.id === userId);
        if (!userToToggle) return prev;
        
        const isSelected = selectedUsers.some(u => u.id === userId);
        return {
            ...prev,
            users: isSelected ? selectedUsers.filter(u => u.id !== userId) : [...selectedUsers, userToToggle],
        };
    });
  };
  
  // --- NOVA FUNÇÃO DE VALIDAÇÃO ---
  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!currentTask.title?.trim()) {
      newErrors.title = 'O título é obrigatório.';
    }
    if (!currentTask.date) {
      newErrors.date = 'A data de início é obrigatória.';
    }
    if (!currentTask.calendar_id) {
      newErrors.calendar_id = 'O calendário é obrigatório.';
    }
    // Adição para consistência, embora o campo sempre tenha um valor.
    if (typeof currentTask.isAllDay !== 'boolean') {
      newErrors.isAllDay = 'O campo "Dia todo" é inválido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateFields()) {
      return;
    }
    setIsLoading(true);
    const totalMinutes = timeValue && timeUnit ? convertToMinutes(Number(timeValue), timeUnit) : null;

    const user_ids = currentTask.users?.map(user => parseInt(user.id, 10)) || [];
    
    const taskPayload = {
      ...currentTask,
      user_ids,
      notification_time_before: totalMinutes,
      calendar_id: parseInt(String(currentTask.calendar_id), 10),
      edit_mode: editMode,
      occurrence_date: task?.date,
    };

    const eventIdForURL = task?.originalId || task?.id;
    const url = isEditing ? `/event/${eventIdForURL}` : "/event";
    const method = isEditing ? 'put' : 'post';

    api[method](url, taskPayload, { headers: { Authorization: `Bearer ${user.token}` }})
      .then(() => {
        setIsLoading(false);
        onClose();
      })
      .catch(err => {
        console.error("Erro ao salvar tarefa:", err.response?.data || err.message);
        alert(`Erro ao salvar: ${err.response?.data?.detail || 'Verifique o console para mais detalhes.'}`);
        setIsLoading(false);
      });
  };

  const handleDelete = () => {
    const eventIdToDelete = currentTask.originalId || currentTask.id;
    if (eventIdToDelete && window.confirm('Tem certeza que deseja excluir este evento?')) {
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
    } else {
        onClose();
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

  useEffect(() => {
    if (currentTask.calendar_id && calendars.length > 0) {
      const selectedCalendar = calendars.find(c => String(c.id) === String(currentTask.calendar_id));
      if (selectedCalendar) {
        setCurrentTask(prev => ({
          ...prev,
          color: prev.color || selectedCalendar.color
        }));
      }
    }
  }, [currentTask.calendar_id, calendars]);

  const getRecurrenceSummary = (rruleString?: string): string => {
    if (!rruleString) return 'Nunca';
    try {
        return rrulestr(rruleString).toText().split(" ").map((text) => getText(text.replace(/[.,!?;:'"()\[\]{}\-]/g, ''))).join(" ");
    } catch {
        return 'Personalizado';
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}));
      }
      
      if (name === 'calendar_id') {
          const selectedCalendar = calendars.find(c => String(c.id) === value);
          if (selectedCalendar) {
              setCurrentTask(prev => ({ 
                  ...prev, 
                  calendar_id: value,
                  color: selectedCalendar.color
              }));
          }
      } else {
          setCurrentTask(prev => ({ ...prev, [name]: value }));
      }
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalOverlay $isOpen={isOpen} onClick={onClose}>
        <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <h2>{isEditing ? 'Editar Tarefa' : 'Criar Tarefa'}</h2>
            <button onClick={onClose}>&times;</button>
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" value={currentTask.title || ''} onChange={handleChange} />
              {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
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
                <Input id="date" name="date" type="date" value={currentTask.date ? format(new Date(currentTask.date), 'yyyy-MM-dd') : ''} onChange={handleDateChange} />
                {errors.date && <ErrorMessage>{errors.date}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input id="endDate" name="endDate" type="date" value={currentTask.endDate ? format(new Date(currentTask.endDate), 'yyyy-MM-dd') : ''} onChange={handleDateChange} />
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
              
              <FormGroup>
                <Label>Repetir</Label>
                <RecurrenceButton onClick={() => setIsRecurrenceModalOpen(true)}>
                    {getRecurrenceSummary(currentTask.recurring_rule)}
                </RecurrenceButton>
              </FormGroup>
            </FormRow>
            <FormGroup>
              <Label>Notificações</Label>
              <Select
                name="notification_type"
                value={currentTask.notification_type || ''}
                onChange={handleChange}
              >
                <option value="">Padrão do Calendário</option>
                <option value="none">Nenhuma</option>
                <option value="email">Apenas E-mail</option>
                <option value="whatsapp">Apenas WhatsApp</option>
                <option value="both">E-mail e WhatsApp</option>
              </Select>
            </FormGroup>
            
            <FormRow>
              <FormGroup style={{ flex: 1 }}>
                <Label>Avisar com antecedência</Label>
                <Input
                  type="number"
                  value={timeValue}
                  placeholder="Padrão"
                  onChange={(e) => setTimeValue(e.target.value)}
                  min="1"
                />
              </FormGroup>
              <FormGroup style={{ flex: 2 }}>
                <Label>&nbsp;</Label>
                <Select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value as TimeUnit | '')}
                >
                  <option value="">Padrão do Calendário</option>
                  <option value="minutes">Minutos</option>
                  <option value="hours">Horas</option>
                  <option value="days">Dias</option>
                  <option value="weeks">Semanas</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormGroup>
                <Label>Repetir aviso (vezes)</Label>
                <Input
                    type="number"
                    name="notification_repeats"
                    value={currentTask.notification_repeats || ''}
                    placeholder="Padrão do Calendário"
                    onChange={handleChange}
                />
            </FormGroup>

            <FormGroup>
              <Label>Mensagem do Lembrete</Label>
              <TextArea
                name="notification_message"
                value={currentTask.notification_message || ''}
                placeholder="Padrão do Calendário"
                onChange={handleChange}
              />
            </FormGroup>

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
              <Select id="calendar_id" name="calendar_id" value={currentTask.calendar_id || ''} onChange={handleSelectChange}>
                <option value="" disabled>Selecione um calendário</option>
                {calendars.map(calendar => (
                  <option key={calendar.id} value={calendar.id}>{calendar.name}</option>
                ))}
              </Select>
              {errors.calendar_id && <ErrorMessage>{errors.calendar_id}</ErrorMessage>}
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

      <RecurrenceModal
        isOpen={isRecurrenceModalOpen}
        onClose={() => setIsRecurrenceModalOpen(false)}
        onSave={(rule) => setCurrentTask(prev => ({ ...prev, recurring_rule: rule }))}
        initialRRule={currentTask.recurring_rule}
        startDate={currentTask.date || new Date()}
      />
    </>
  );
};

export default TaskModal;
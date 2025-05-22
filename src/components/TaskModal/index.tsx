// src/components/TaskModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { Button, Card } from '../Common';
import type { Calendar, Task, User } from '../../types';
import { theme } from '../../styles/theme';
import { format, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import api from '../../services/axios';
import ActivityIndicator from '../ActivityIndicator';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null; // Tarefa para edição/visualização. Null para criação.
  onDelete: (taskId: string) => void;
  initialDate?: Date; // Data inicial para nova tarefa
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  ${({ $isOpen }) => $isOpen && css`
    opacity: 1;
    visibility: visible;
  `}
`;

const ModalContent = styled(Card)<{ $isOpen: boolean }>`
  background-color: ${theme.colors.surface};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;

  ${({ $isOpen }) => $isOpen && css`
    transform: translateY(0);
    opacity: 1;
  `}
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: ${theme.colors.textPrimary};
  }
  button {
    background: none;
    border: none;
    font-size: 1.8rem;
    color: ${theme.colors.textSecondary};
    cursor: pointer;
    &:hover {
      color: ${theme.colors.primary};
    }
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing.sm};
`;

const Select = styled.select`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius};
  font-size: 1rem;
  background-color: ${theme.colors.background}; /* já escuro */
  color: ${theme.colors.textPrimary};
  transition: border-color 0.2s ease;
  appearance: none; /* remove setinha padrão */
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg fill='%23ccc' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right ${theme.spacing.sm} center;
  background-size: 1rem;
  padding-right: 2rem; /* espaço para a seta */

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  option {
    background-color: ${theme.colors.background}; /* força fundo escuro nas opções */
    color: ${theme.colors.textPrimary};
  }
`;


const Label = styled.label`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xs};
  font-weight: 500;
`;

const Input = styled.input`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius};
  font-size: 1rem;
  background-color: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  transition: border-color 0.2s ease;
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius};
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  background-color: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  label {
    margin-bottom: 0;
  }
`;

const TimeInputs = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  ${Input} {
    flex: 1;
  }
`;

const ColorPickerContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const ColorSwatch = styled.div<{ $color: string; $isSelected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  cursor: pointer;
  border: 2px solid ${props => props.$isSelected ? theme.colors.primary : 'transparent'};
  box-shadow: ${props => props.$isSelected ? `0 0 0 2px ${theme.colors.primaryLight}` : 'none'};
  transition: all 0.2s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
`;

const predefinedColors = [
  '#FFDDC1', '#D4E8D4', '#C7CEEA', '#F0E68C', '#AED6F1', '#FFC0CB', '#AFEEEE', '#E6E6FA', '#87CEEB', '#B0C4DE',
];

const ModalFooter = styled.div<{ $isEditing: boolean }>`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};

  ${props => props.$isEditing && `
    justify-content: space-between;
  `}
`;

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onDelete, initialDate }) => {
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    date: initialDate || new Date(),
    isAllDay: false,
    startTime: '',
    endTime: '',
    color: predefinedColors[0],
    calendar_id: '',
    user_id: ''
  });
  const [users, setUsers] = useState<Array<User>>([]);
  const [calendars, setCalendars] = useState<Array<Calendar>>([]);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const isEditing = !!task;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (task) {
      setCurrentTask({
        ...task,
        date: task.date instanceof Date ? task.date : parseISO(new Date(task.date).toISOString()), // Ensure it's a Date object
        startTime: task.startTime || '',
        endTime: task.endTime || '',
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
        user_id: ''
      });
    }
  }, [task, initialDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
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
    setCurrentTask(prev => ({ ...prev, date: new Date(dateString + 'T12:00:00') })); // Set to noon to avoid timezone issues
  };

  const handleSave = () => {
    if (!currentTask.title || !currentTask.date || !currentTask.calendar_id || !currentTask.user_id) {
      alert('Título, Data, Usuário e Calendario são obrigatórios.');
      return;
    }
    setIsLoading(true);

    const newTask: Task = {
      id: currentTask.id || uuidv4(),
      title: currentTask.title,
      description: currentTask.description,
      date: currentTask.date,
      isAllDay: currentTask.isAllDay,
      startTime: currentTask.startTime,
      endTime: currentTask.endTime,
      color: currentTask.color,
      calendar_id: String(currentTask.calendar_id),
      user_id: String(currentTask.user_id)
    };
    const req = api.post("/event", {...newTask}, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    })
    
    req.then(() => {
      setIsLoading(false);
      onClose();
    }).catch(err => {
      console.log(err);
      setIsLoading(false);
    })
  };

  const handleDelete = () => {
    if (task?.id && window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      onDelete(task.id);
      onClose();
    }
  };

  const fetchAllCalendars = useCallback(async () => {
    try{
      const req = await api.get("/calendar", {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const calendars = req.data as Array<Calendar>;
      setCalendars(calendars);
    }catch(err){
      console.log(err);
    }
  }, [user]);

  const fetchAllUsers = useCallback(async () => {
    try{
      const req = await api.get("/user", {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const users = req.data as Array<User>;
      setUsers(users);
    }catch(err){
      console.log(err);
    }
  }, [user]);

  useEffect(() => {
    fetchAllUsers();
    fetchAllCalendars();
  }, [fetchAllUsers, fetchAllCalendars]);

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
            <Input
              id="title"
              name="title"
              value={currentTask.title || ''}
              onChange={handleChange}
              placeholder="Nome da tarefa"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="description">Descrição</Label>
            <TextArea
              id="description"
              name="description"
              value={currentTask.description || ''}
              onChange={handleChange}
              placeholder="Detalhes da tarefa (opcional)"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={currentTask.date ? format(currentTask.date, 'yyyy-MM-dd') : ''}
              onChange={handleDateChange}
              required
            />
          </FormGroup>
          <CheckboxGroup>
            <Input
              id="isAllDay"
              name="isAllDay"
              type="checkbox"
              checked={currentTask.isAllDay || false}
              onChange={handleChange}
            />
            <Label htmlFor="isAllDay">Dia todo</Label>
          </CheckboxGroup>

          {/* Dropdown para Usuário */}
          <FormGroup>
            <Label htmlFor="user_id">Usuário</Label>
            <Select
              id="user_id"
              name="user_id"
              value={currentTask.user_id || ''}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecione um usuário</option>
              {/* Assumindo que 'availableUsers' é um array de objetos User com 'id' e 'name' */}
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} {/* Adapte para o campo de nome correto do seu tipo User */}
                </option>
              ))}
            </Select>
          </FormGroup>

          {/* Dropdown para Calendário */}
          <FormGroup>
            <Label htmlFor="calendar_id">Calendário</Label>
            <Select
              id="calendar_id"
              name="calendar_id"
              value={currentTask.calendar_id || ''}
              onChange={(e) => {
                const aux = calendars.find(c => c.id === e.target.value);
                setCurrentTask({
                  ...currentTask,
                  color: aux?.color
                });
                handleChange(e);
              }}
              required
            >
              <option value="" disabled>Selecione um calendário</option>
              {/* Assumindo que 'availableCalendars' é um array de objetos Calendar com 'id' e 'name' */}
              {calendars.map(calendar => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name} {/* Adapte para o campo de nome correto do seu tipo Calendar */}
                </option>
              ))}
            </Select>
          </FormGroup>

          {!currentTask.isAllDay && (
            <TimeInputs>
              <FormGroup>
                <Label htmlFor="startTime">Início</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={currentTask.startTime || ''}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="endTime">Fim</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={currentTask.endTime || ''}
                  onChange={handleChange}
                />
              </FormGroup>
            </TimeInputs>
          )}
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
            </ColorPickerContainer>
          </FormGroup>
        </ModalBody>
        <ModalFooter $isEditing={isEditing}>
          {isEditing && (
            <Button danger onClick={handleDelete}>
              Excluir
            </Button>
          )}
          <div>
            <Button outline onClick={onClose}>
              Cancelar
            </Button>
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <Button primary onClick={handleSave} style={{ marginLeft: theme.spacing.md }}>
                {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
              </Button>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TaskModal;
// src/components/TaskModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../Common';
import type { Calendar, Task, User } from '../../types';
import { format, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import api from '../../services/axios';
import ActivityIndicator from '../ActivityIndicator';
import { CheckboxGroup, ColorPickerContainer, ColorSwatch, FormGroup, Input, Label, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, 
  Select, TextArea, TimeInputs, UserCheckboxItem, UserSelectorContainer
 } from './styled';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null; // Tarefa para edição/visualização. Null para criação.
  initialDate?: Date; // Data inicial para nova tarefa
}

const predefinedColors = [
  '#FFDDC1', '#D4E8D4', '#C7CEEA', '#F0E68C', '#AED6F1', '#FFC0CB', '#AFEEEE', '#E6E6FA', '#87CEEB', '#B0C4DE',
];

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, initialDate }) => {
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
        users: [],
      });
    }
  }, [task, initialDate]);

  const handleUserChange = (userId: string) => {
    setCurrentTask(prev => {
      const selectedUsers = prev.users || [];
      const userIndex = selectedUsers.findIndex(u => u.id === userId);
      const user = users.find(u => u.id === userId);

      if (!user) return prev;

      if (userIndex > -1) {
        // Remove usuário se já estiver selecionado
        return { ...prev, users: selectedUsers.filter(u => u.id !== userId) };
      } else {
        // Adiciona usuário
        return { ...prev, users: [...selectedUsers, user] };
      }
    });
  };

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
    if (!currentTask.title || !currentTask.date || !currentTask.calendar_id || !currentTask.users) {
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
      users: currentTask.users ? currentTask.users : []
    };

    const req = isEditing ? api.put(`/event/${currentTask.id}`, {...newTask}, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    }) : api.post("/event", {...newTask}, {
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
    });
  };

  const handleDelete = () => {
    if (task?.id && window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setIsLoading(true);
      api.delete(`/event/${task.id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      })
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

    return () => {
      setCalendars([]);
      setUsers([]);
    }
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
            <Label>Participantes</Label>
            <UserSelectorContainer>
              {users.map(user => (
                <UserCheckboxItem key={user.id}>
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={currentTask.users?.some(u => u.id === user.id) || false}
                    onChange={() => handleUserChange(user.id)}
                  />
                  <label htmlFor={`user-${user.id}`}>{user.name}</label>
                </UserCheckboxItem>
              ))}
            </UserSelectorContainer>
          </FormGroup>

          {/* Dropdown para Calendário */}
          <FormGroup>
            <Label htmlFor="calendar_id">Calendário</Label>
            <Select
              id="calendar_id"
              name="calendar_id"
              value={currentTask.calendar_id || ''}
              onChange={(e) => {
                const aux = calendars.find(c => Number(c.id) === Number(e.target.value));

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
          {isEditing && !isLoading && (
            <Button danger onClick={handleDelete}>
              Excluir
            </Button>
          )}
          <div>
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <>
                <Button outline onClick={onClose}>
                  Cancelar
                </Button>
                <Button primary onClick={handleSave}>
                  {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
                </Button>
              </>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TaskModal;
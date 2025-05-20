// src/components/TaskModal.tsx
import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Button, Card } from '../Common';
import type { Task } from '../../types';
import { theme } from '../../styles/theme';
import { format, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null; // Tarefa para edição/visualização. Null para criação.
  onSave: (task: Task) => void;
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

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onSave, onDelete, initialDate }) => {
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    date: initialDate || new Date(),
    isAllDay: false,
    startTime: '',
    endTime: '',
    color: predefinedColors[0],
  });

  const isEditing = !!task;

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
      });
    }
  }, [task, initialDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!currentTask.title || !currentTask.date) {
      alert('Título e Data são obrigatórios.');
      return;
    }

    const newTask: Task = {
      id: currentTask.id || uuidv4(),
      title: currentTask.title,
      description: currentTask.description,
      date: currentTask.date,
      isAllDay: currentTask.isAllDay,
      startTime: currentTask.startTime,
      endTime: currentTask.endTime,
      color: currentTask.color,
    };
    onSave(newTask);
    onClose();
  };

  const handleDelete = () => {
    if (task?.id && window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      onDelete(task.id);
      onClose();
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
            <Button primary onClick={handleSave} style={{ marginLeft: theme.spacing.md }}>
              {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TaskModal;
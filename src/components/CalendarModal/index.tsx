// src/components/CalendarModal.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Card } from '../Common';
import { theme } from '../../styles/theme';
import type { Calendar } from '../../types';
import type { AuthState } from '../../store/modules/types';
import { useSelector } from 'react-redux';
import api from '../../services/axios';
import ActivityIndicator from '../ActivityIndicator';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendar?: Calendar | null; // Calendário para edição/visualização. Null para criação.
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

  ${props => props.$isOpen && `
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

  ${props => props.$isOpen && `
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

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  label {
    margin-bottom: 0;
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
  transform: ${props => props.$isSelected ? 'scale(1.1)': '' };

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

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, calendar }) => {
  const [currentCalendar, setCurrentCalendar] = useState<Calendar>({
    name: '',
    color: predefinedColors[0],
    visible: true,
    id: "",
    tasks: []
  });
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const isEditing = !!calendar?.id;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  console.log(calendar);
  useEffect(() => {
    if (calendar) {
      setCurrentCalendar({
        name: calendar.name,
        color: calendar.color,
        visible: calendar.visible,
        id: calendar.id,
        tasks: calendar.tasks
      });
    } else {
      setCurrentCalendar({
        name: '',
        color: predefinedColors[0],
        visible: true,
        id: '',
        tasks: []
      });
    }
  }, [calendar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCurrentCalendar(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    if (!currentCalendar.name) {
      alert('O nome do calendário é obrigatório.');
      return;
    }
    const calendarToSave = calendar?.id
      ? { ...currentCalendar, id: calendar.id }
      : currentCalendar;

    const req = isEditing ? api.put(`/calendar/${calendarToSave.id}`, {...calendarToSave}, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    }) : api.post("/calendar", {...calendarToSave}, {
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
    onClose();
  };

  const handleDelete = () => {
    if (calendar?.id && window.confirm('Tem certeza que deseja excluir este calendário?')) {
      setIsLoading(true);
      api.delete(`/calendar/${calendar.id}`, {
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
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{isEditing ? 'Editar Calendário' : 'Novo Calendário'}</h2>
          <button onClick={onClose}>&times;</button>
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={currentCalendar.name}
              onChange={handleChange}
              placeholder="Nome do calendário"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Cor</Label>
            <ColorPickerContainer>
              {predefinedColors.map(color => (
                <ColorSwatch
                  key={color}
                  $color={color}
                  $isSelected={currentCalendar.color === color}
                  onClick={() => setCurrentCalendar(prev => ({ ...prev, color }))}
                />
              ))}
            </ColorPickerContainer>
          </FormGroup>
          <CheckboxGroup>
            <Input
              id="visible"
              name="visible"
              type="checkbox"
              checked={currentCalendar.visible ? currentCalendar.visible : false}
              onChange={(e) => {
                setCurrentCalendar({ ...currentCalendar, visible: e.target.checked });
              }}
            />
            <Label htmlFor="visible">Visível</Label>
          </CheckboxGroup>
        </ModalBody>
        <ModalFooter $isEditing={isEditing}>
          {isEditing && !isLoading && (
            <Button danger onClick={handleDelete}>
              Excluir
            </Button>
          )}
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <div>
              <Button outline onClick={onClose}>
                Cancelar
              </Button>
              <Button primary onClick={handleSave} style={{ marginLeft: theme.spacing.md }}>
                {isEditing ? 'Salvar Alterações' : 'Criar Calendário'}
              </Button>
            </div>
          )}
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CalendarModal;
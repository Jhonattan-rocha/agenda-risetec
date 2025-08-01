// src/components/CalendarModal/index.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Card, Select, TextArea } from '../Common';
import type { Calendar, Profile } from '../../types';
import type { AuthState } from '../../store/modules/types';
import { useSelector } from 'react-redux';
import api from '../../services/axios';
import ActivityIndicator from '../ActivityIndicator';
import { usePermission } from '../../hooks/usePermission';
import { convertToMinutes, convertFromMinutes, type TimeUnit } from '../../utils/timeConverter'; // NOVO

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendar?: Calendar | null;
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
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const ModalContent = styled(Card)<{ $isOpen: boolean }>`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  transform: ${props => (props.$isOpen ? 'translateY(0)' : 'translateY(20px)')};
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  transition: transform 0.3s ease, opacity 0.3s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  button {
    background: none;
    border: none;
    font-size: 1.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: pointer;
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-weight: 500;
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: border-color 0.2s ease;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  label {
    margin-bottom: 0;
  }
`;

const ColorPickerContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
  align-items: center; // Alinha o input de cor com as bolinhas
`;

const ColorSwatch = styled.div<{ $color: string; $isSelected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  cursor: pointer;
  border: 2px solid ${props => props.$isSelected ? props.theme.colors.primary : 'transparent'};
  box-shadow: ${props => props.$isSelected ? `0 0 0 2px ${props.theme.colors.primaryLight}` : 'none'};
  transition: all 0.2s ease-in-out;
  transform: ${props => props.$isSelected ? 'scale(1.1)': '' };

  &:hover {
    transform: scale(1.1);
  }
`;

// NOVO: Estilo para o input de cor customizada
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

const ModalFooter = styled.div<{ $isEditing: boolean }>`
  display: flex;
  justify-content: ${props => props.$isEditing ? 'space-between' : 'flex-end'};
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const FormRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  
  & > * {
    flex: 1;
  }
`;

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, calendar }) => {
  const [currentCalendar, setCurrentCalendar] = useState<Partial<Calendar>>({
    name: '',
    color: predefinedColors[0],
    visible: true,
    notification_type: 'email',
    notification_time_before: 30,
    notification_repeats: 1,
    notification_message: 'Lembrete: {event_title} às {event_time}.'
  });
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const isEditing = !!calendar?.id;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const canUpdateCalendar = usePermission('update', `calendar_${calendar?.id}`, user.user.profile as Profile);
  const canDeleteCalendar = usePermission('delete', `calendar_${calendar?.id}`, user.user.profile as Profile);
  const canCreateCalendar = usePermission('create', 'calendars', user.user.profile as Profile);
  const canSave = isEditing ? canUpdateCalendar : canCreateCalendar;
  const [timeValue, setTimeValue] = useState<number>(30);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('minutes');

  // NOVO: Verifica se a cor atual é uma das predefinidas
  const isCustomColor = !predefinedColors.includes(currentCalendar.color || '');

  // O useEffect vai cuidar de adicionar e remover o event listener
  useEffect(() => {
    
    // 1. Criamos a função que vai lidar com a tecla pressionada
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Se a tecla for "Escape", chamamos a função para fechar o modal
        onClose();
      }
    };

    // 2. Adicionamos o listener apenas se o modal estiver aberto
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // 3. A "função de limpeza" do useEffect: ESSA PARTE É CRUCIAL!
    // Ela será executada quando o componente for "desmontado" ou antes de o efeito rodar novamente.
    return () => {
      // Removemos o listener para evitar memory leaks (vazamentos de memória)
      // e para que ele não continue "escutando" depois que o modal fechar.
      document.removeEventListener('keydown', handleKeyDown);
    };
    
    // O efeito depende de `isOpen` e `onClose`. Ele vai re-executar se um deles mudar.
  }, [isOpen, onClose]);

  useEffect(() => {
    if (calendar) {
      setCurrentCalendar(calendar);
      // Converte os minutos do backend para um formato amigável para a UI
      const [value, unit] = convertFromMinutes(calendar.notification_time_before);
      setTimeValue(value);
      setTimeUnit(unit);
    } else {
      // Estado inicial para um novo calendário
      setCurrentCalendar({
        name: '',
        color: predefinedColors[0],
        visible: true,
        notification_type: 'email',
        notification_repeats: 1,
        notification_message: 'Lembrete: {event_title} às {event_time}.'
      });
      setTimeValue(30);
      setTimeUnit('minutes');
    }
  }, [calendar, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setCurrentCalendar(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    if (!currentCalendar.name) {
      alert('O nome do calendário é obrigatório.');
      return;
    }
    const totalMinutes = convertToMinutes(timeValue, timeUnit);
    
    setIsLoading(true);

    const req = isEditing 
      ? api.put(`/calendar/${calendar?.id}`, {...currentCalendar, notification_time_before: totalMinutes}, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      : api.post("/calendar", {...currentCalendar, notification_time_before: totalMinutes}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
    
    req.then(() => {
      setIsLoading(false);
      onClose();
    }).catch(err => {
      console.log(err);
      setIsLoading(false);
    });
  };

  const handleDelete = () => {
    if (calendar?.id && window.confirm('Tem certeza que deseja excluir este calendário?')) {
      setIsLoading(true);
      api.delete(`/calendar/${calendar.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
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
              value={currentCalendar.name || ''}
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
              {/* NOVO: Seletor de cor customizada */}
              <ColorSwatch $color={isCustomColor ? currentCalendar.color! : '#ccc'} $isSelected={isCustomColor}>
                  <CustomColorInput
                      name="color"
                      value={currentCalendar.color || '#ffffff'}
                      onChange={handleChange}
                  />
              </ColorSwatch>
            </ColorPickerContainer>
          </FormGroup>
          <CheckboxGroup>
            <Input
              id="visible"
              name="visible"
              type="checkbox"
              checked={currentCalendar.visible ?? false}
              onChange={handleChange}
            />
            <Label htmlFor="visible">Visível</Label>
          </CheckboxGroup>
          <FormGroup>
              <Label>Notificações</Label>
              <Select
                name="notification_type"
                value={currentCalendar.notification_type || 'email'}
                onChange={handleChange}
              >
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
                    onChange={(e) => setTimeValue(Number(e.target.value))}
                    min="1"
                />
              </FormGroup>
              <FormGroup style={{ flex: 2 }}>
                <Label>&nbsp;</Label>
                <Select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
                >
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
                    value={currentCalendar.notification_repeats || 1}
                    onChange={handleChange}
                />
            </FormGroup>
            <FormGroup>
              <Label>Mensagem do Lembrete</Label>
              <TextArea
                name="notification_message"
                value={currentCalendar.notification_message || ''}
                onChange={handleChange}
                placeholder="Use {event_title} e {event_time}"
              />
              <small>Placeholders: `_event_title_`, `_event_time_`</small>
            </FormGroup>
        </ModalBody>
        <ModalFooter $isEditing={isEditing}>
          {isEditing && !isLoading && canDeleteCalendar && (
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
              {canSave && (
                <Button primary onClick={handleSave}>
                  {isEditing ? 'Salvar Alterações' : 'Criar Calendário'}
                </Button>
              )}
            </div>
          )}
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CalendarModal;
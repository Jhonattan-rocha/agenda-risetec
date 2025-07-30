// src/components/Calendar/ViewModeSelector.tsx
import React from 'react';
import styled from 'styled-components';
// 1. Importar os ícones que vamos usar
import { FiCalendar, FiColumns, FiSquare, FiList } from 'react-icons/fi';
import { Button } from '../Common';
import type { ViewMode } from '../../types';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

// Container ajustado para espaçar os botões
const SelectorContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm}; // Espaçamento entre os botões
  margin: 0 20px;
`;

// Botão de modo completamente reestilizado para ser circular
const ModeButton = styled(Button)<{ $isActive: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%; // Deixa o botão perfeitamente redondo
  padding: 0; // Remove padding para centralizar o ícone
  display: flex;
  align-items: center;
  justify-content: center;
  
  // Estilos de estado ativo e inativo
  background-color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.$isActive ? props.theme.colors.surface : props.theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.boxShadow};
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    background-color: ${props => props.$isActive ? props.theme.colors.primaryLight : props.theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }

  // Remove estilos desnecessários do seletor antigo
  &:not(:last-child) {
    border-right: none;
  }
`;

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({ currentMode, onModeChange }) => {
  // 2. Mapear os modos para ícones e títulos para facilitar a renderização
  const viewModes = [
    { mode: 'month', icon: <FiCalendar size={20} />, title: 'Mês' },
    { mode: 'week', icon: <FiColumns size={20} />, title: 'Semana' },
    { mode: 'day', icon: <FiSquare size={20} />, title: 'Dia' },
    { mode: 'tasks', icon: <FiList size={20} />, title: 'Tarefas' },
  ];

  return (
    <SelectorContainer>
      {viewModes.map(({ mode, icon, title }) => (
        <ModeButton
          key={mode}
          $isActive={currentMode === mode}
          onClick={() => onModeChange(mode as ViewMode)}
          title={title}
        >
          {icon}
        </ModeButton>
      ))}
    </SelectorContainer>
  );
};

export default ViewModeSelector;
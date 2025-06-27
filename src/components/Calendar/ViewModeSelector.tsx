// src/components/Calendar/ViewModeSelector.tsx
import React from 'react';
import styled from 'styled-components';
import { Button } from '../Common';
import type { ViewMode } from '../../types';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const SelectorContainer = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
  overflow: hidden; // Ensures rounded corners are applied
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModeButton = styled(Button)<{ $isActive: boolean }>`
  flex: 1;
  border-radius: 0; // Override common button rounded corners
  background-color: ${props => props.$isActive ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$isActive ? props.theme.colors.surface : props.theme.colors.textSecondary};
  font-weight: ${props => props.$isActive ? '600' : 'normal'};
  &:hover {
    background-color: ${props => props.$isActive ? props.theme.colors.primaryLight : props.theme.colors.primary}1A;
    color: ${props => props.$isActive ? props.theme.colors.surface : props.theme.colors.primary};
    transform: none; // Reset transform from base Button
    box-shadow: none; // Reset box-shadow from base Button
  }
  &:first-child {
    border-top-left-radius: ${({ theme }) => theme.borderRadius};
    border-bottom-left-radius: ${({ theme }) => theme.borderRadius};
  }
  &:last-child {
    border-top-right-radius: ${({ theme }) => theme.borderRadius};
    border-bottom-right-radius: ${({ theme }) => theme.borderRadius};
  }
  // Add a divider between buttons
  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <SelectorContainer>
      <ModeButton
        $isActive={currentMode === 'month'}
        onClick={() => onModeChange('month')}
      >
        Mês
      </ModeButton>
      <ModeButton
        $isActive={currentMode === 'week'}
        onClick={() => onModeChange('week')}
      >
        Semana
      </ModeButton>
      <ModeButton
        $isActive={currentMode === 'day'}
        onClick={() => onModeChange('day')}
      >
        Dia
      </ModeButton>
      <ModeButton
        $isActive={currentMode === 'tasks'}
        onClick={() => onModeChange('tasks')}
      >
        Tarefas
      </ModeButton>
    </SelectorContainer>
  );
};

export default ViewModeSelector;
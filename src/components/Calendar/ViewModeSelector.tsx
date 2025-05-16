// src/components/Calendar/ViewModeSelector.tsx
import React from 'react';
import styled from 'styled-components';
import { Button } from '../Common';
import type { ViewMode } from '../../types';
import { theme } from '../../styles/theme';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const SelectorContainer = styled.div`
  display: flex;
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius};
  box-shadow: ${theme.boxShadow};
  overflow: hidden; // Ensures rounded corners are applied
  margin-bottom: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
`;

const ModeButton = styled(Button)<{ $isActive: boolean }>`
  flex: 1;
  border-radius: 0; // Override common button rounded corners
  background-color: ${props => props.$isActive ? theme.colors.primary : 'transparent'};
  color: ${props => props.$isActive ? theme.colors.surface : theme.colors.textSecondary};
  font-weight: ${props => props.$isActive ? '600' : 'normal'};
  &:hover {
    background-color: ${props => props.$isActive ? theme.colors.primaryLight : theme.colors.primary}1A;
    color: ${props => props.$isActive ? theme.colors.surface : theme.colors.primary};
    transform: none; // Reset transform from base Button
    box-shadow: none; // Reset box-shadow from base Button
  }
  &:first-child {
    border-top-left-radius: ${theme.borderRadius};
    border-bottom-left-radius: ${theme.borderRadius};
  }
  &:last-child {
    border-top-right-radius: ${theme.borderRadius};
    border-bottom-right-radius: ${theme.borderRadius};
  }
  // Add a divider between buttons
  &:not(:last-child) {
    border-right: 1px solid ${theme.colors.border};
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
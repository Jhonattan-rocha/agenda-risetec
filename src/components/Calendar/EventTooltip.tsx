// src/components/Calendar/EventTooltip.tsx

import React from 'react';
import styled from 'styled-components';
import type { Task } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventTooltipProps {
  task: Task;
  position: { top: number; left: number };
}

const TooltipContainer = styled.div<{ top: number; left: number }>`
  position: fixed;
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
  padding: ${({ theme }) => theme.spacing.md};
  z-index: 1002;
  width: 300px;
  max-height: 300px;
  pointer-events: none; // Impede que o tooltip interfira com outros eventos do mouse
`;

const TooltipHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ColorIndicator = styled.div<{ color?: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ color, theme }) => color || theme.colors.primary};
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const TooltipTitle = styled.h4`
  margin: 0;
  font-size: 1.1rem;
`;

const TooltipBody = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  p {
    margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  }
`;

const EventTooltip: React.FC<EventTooltipProps> = ({ task, position }) => {
  return (
    <TooltipContainer top={position.top} left={position.left}>
      <TooltipHeader>
        <ColorIndicator color={task.color} />
        <TooltipTitle>{task.title}</TooltipTitle>
      </TooltipHeader>
      <TooltipBody>
        <p>
          {format(new Date(task.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
        <p>
          {task.isAllDay
            ? 'Dia todo'
            : `${task.startTime || ''} - ${task.endTime || ''}`}
        </p>
        {task.description && <p>{task.description}</p>}
      </TooltipBody>
    </TooltipContainer>
  );
};

export default EventTooltip;
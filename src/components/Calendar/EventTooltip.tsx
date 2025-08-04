// src/components/Calendar/EventTooltip.tsx

import React, { useCallback, useEffect, useState, type Ref } from 'react';
import styled from 'styled-components';
import type { Calendar, Task } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../services/axios';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';

interface EventTooltipProps {
  task: Task;
  position: { top: number; left: number };
  ref: Ref<HTMLDivElement> | undefined;
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
  width: 400px;
  max-height: 400px;
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

const EventTooltip: React.FC<EventTooltipProps> = ({ task, position, ref }) => {
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const [calendar, setCalendar] = useState<string>("");

  const fetchCalendar = useCallback(async () => {
    try {
      const req = await api.get(`/calendar/${task.calendar_id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      const result = req.data as Calendar;
      setCalendar(result.name);
    } catch(err) {
      console.log(err);
    }
  }, [task, user]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return (
    <TooltipContainer top={position.top} left={position.left} ref={ref}>
      <TooltipHeader>
        <ColorIndicator color={task.color} />
        <TooltipTitle>{task.title}</TooltipTitle>
      </TooltipHeader>
      <TooltipBody>
        <p>Cliente: {calendar}</p>
        <p>
          {format(new Date(task.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
        <p>
          {task.isAllDay
            ? 'Dia todo'
            : `${task.startTime || ''} - ${task.endTime || ''}`}
        </p>
        {task.description && (
          <>
            <p>------------------------------------------------------------------</p>
            <p>Descrição: {task.description}</p>
            <p>------------------------------------------------------------------</p>
          </>
        )}
        <p>Participantes</p>
        <ol style={{ padding: 15 }}>
          {task.users?.map(usr => {
            return (
              <li>{usr.name}</li>
            );
          })}
        </ol>
      </TooltipBody>
    </TooltipContainer>
  );
};

export default EventTooltip;
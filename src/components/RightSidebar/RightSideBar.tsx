// src/components/RightSidebar/RightSidebar.tsx
import React from 'react';
import styled from 'styled-components';
import MiniCalendar from './MiniCalendar';
import UpcomingTasks from './UpcomingTasks';
import type { Calendar, Task } from '../../types';
import DailyTasks from './DailyTasks';
import Calendars from './Calendars';
import { isSameDay } from 'date-fns'; // NOVO: Importa isSameDay

interface RightSidebarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  selectedDate: Date;
  tasks: Task[];
  calendars: Calendar[];
  onTaskClick: (task: Task) => void;
  onCalendarClick: (calendar: Calendar) => void;
  onCreateCalendar: () => void;
  onUpdate: () => void;
}

const SidebarContainer = styled.aside`
  width: 300px;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.background}; 
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  overflow-y: auto;

  @media (max-width: 1200px) {
    width: 280px;
    padding: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: 900px) {
    width: 100%;
    border-left: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing.md};
    & > * {
      flex: 1 1 auto;
      min-width: 250px;
      max-width: 300px;
    }
  }
`;

const RightSidebar: React.FC<RightSidebarProps> = ({ currentDate, onDateChange, onUpdate, selectedDate, tasks, calendars, onTaskClick, onCalendarClick, onCreateCalendar }) => {
  return (
    <SidebarContainer>
      <MiniCalendar currentDate={currentDate} onDateClick={onDateChange} selectedDate={selectedDate} />
      <Calendars
        onCreateCalendar={onCreateCalendar}
        calendars={calendars}
        onCalendarClick={onCalendarClick}
        onUpdate={onUpdate}
      />
      {/* CORRIGIDO: Usa isSameDay para uma comparação de data mais segura */}
      <DailyTasks 
        onTaskClik={onTaskClick} 
        tasks={tasks.filter(task => isSameDay(new Date(task.date), currentDate))}
      />
      {/* O componente UpcomingTasks já recebe a lista 'tasks' corretamente filtrada por permissão */}
      <UpcomingTasks onTaskClik={onTaskClick} tasks={tasks} />
    </SidebarContainer>
  );
};

export default RightSidebar;
// src/components/RightSidebar/RightSidebar.tsx
import React from 'react';
import styled from 'styled-components';
import MiniCalendar from './MiniCalendar';
import UpcomingTasks from './UpcomingTasks';
import type { Calendar, Task } from '../../types';
import DailyTasks from './DailyTasks';
import Calendars from './Calendars';
import { isSameDay } from 'date-fns';

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
  width: 320px;
  min-width: 300px;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.background}; 
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
  height: calc(100vh - 61px);

  @media (max-width: 1200px) {
    width: 280px;
    min-width: 280px;
    padding: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: 900px) {
    width: 100%;
    height: auto;
    max-height: 40vh; // Limita a altura em modo horizontal
    border-left: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    flex-direction: row;
    flex-wrap: nowrap; // Para permitir scroll horizontal
    justify-content: flex-start;
    align-items: stretch;
    padding: ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.md};
    overflow-x: auto;
    
    & > * {
      flex: 0 0 280px; // Largura fixa para cada item
      min-width: 250px;
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
      <DailyTasks 
        onTaskClik={onTaskClick} 
        tasks={tasks.filter(task => isSameDay(new Date(task.date), currentDate))}
      />
      <UpcomingTasks onTaskClik={onTaskClick} tasks={tasks} />
    </SidebarContainer>
  );
};

export default RightSidebar;
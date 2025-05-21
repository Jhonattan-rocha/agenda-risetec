// src/components/RightSidebar/RightSidebar.tsx
import React from 'react';
import styled from 'styled-components';
import MiniCalendar from './MiniCalendar';
import UpcomingTasks from './UpcomingTasks';
import { theme } from '../../styles/theme';
import type { Calendar, Task } from '../../types';
import DailyTasks from './DailyTasks';
import Calendars from './Calendars';

interface RightSidebarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  selectedDate: Date;
  tasks: Task[];
  calendars: Calendar[];
  onTaskClick: (task: Task) => void;
  onCalendarClick: (calendar: Calendar) => void;
}

const SidebarContainer = styled.aside`
  width: 300px;
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.background}; // Slightly different background for distinction
  border-left: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  overflow-y: auto;

  @media (max-width: 1200px) {
    width: 280px;
    padding: ${theme.spacing.md};
  }

  @media (max-width: 900px) {
    width: 100%;
    border-left: none;
    border-top: 1px solid ${theme.colors.border};
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: ${theme.spacing.md};
    & > * {
      flex: 1 1 auto;
      min-width: 250px;
      max-width: 300px;
    }
  }
`;

const RightSidebar: React.FC<RightSidebarProps> = ({ currentDate, onDateChange, selectedDate, tasks, calendars, onTaskClick, onCalendarClick }) => {
  return (
    <SidebarContainer>
      <MiniCalendar currentDate={currentDate} onDateClick={onDateChange} selectedDate={selectedDate} />
      <Calendars
        calendars={calendars}
        onCalendarClick={onCalendarClick}
      />
      <DailyTasks onTaskClik={onTaskClick} tasks={tasks.filter(task => {
          const aux = new Date(currentDate.toISOString());
          aux.setHours(0);
          aux.setMinutes(0);
          aux.setSeconds(0);
          aux.setMilliseconds(0);
          console.log(task.date.toISOString(), aux.toISOString(), task.date.toISOString() === aux.toISOString());
          return task.date.toISOString() === aux.toISOString();
      })}/>
      <UpcomingTasks onTaskClik={onTaskClick} tasks={tasks} />
    </SidebarContainer>
  );
};

export default RightSidebar;
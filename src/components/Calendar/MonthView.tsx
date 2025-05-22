// src/components/Calendar/MonthView.tsx
import React from 'react';
import styled from 'styled-components';
import { format, isSameDay } from 'date-fns';
import type { DayInfo, Task } from '../../types';
import { theme } from '../../styles/theme';
import { Card } from '../Common';

interface MonthViewProps {
  days: DayInfo[];
  tasks: Task[];
  onDayClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: ${theme.colors.border}; // Grid lines
  border-radius: ${theme.borderRadius};
  overflow: hidden; // Ensures corners are rounded

  .weekdays-header {
    display: contents; // Makes children act as direct grid items
    span {
      background-color: ${theme.colors.surface};
      padding: ${theme.spacing.sm};
      text-align: center;
      font-weight: 600;
      color: ${theme.colors.primary};
      font-size: 0.9rem;
      border-bottom: 1px solid ${theme.colors.border};
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const DayCell = styled(Card)<{ $isCurrentMonth: boolean; $isToday: boolean; $hasTasks: boolean; }>`
  min-height: 120px; // A bit more space for tasks
  height: auto;
  background-color: ${props => props.$isCurrentMonth ? theme.colors.surface : theme.colors.background};
  color: ${props => props.$isCurrentMonth ? theme.colors.textPrimary : theme.colors.textSecondary};
  padding: ${theme.spacing.xs};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: background-color 0.2s ease, transform 0.1s ease;
  border: ${props => props.$isToday ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`};
  box-shadow: none; // Reset card default shadow for grid cells
  position: relative;
  overflow: hidden; // Hide overflow for task list

  &:hover {
    background-color: ${theme.colors.primary}08; // Light overlay on hover
    transform: translateY(-2px);
    box-shadow: ${theme.boxShadow};
    z-index: 1; // Bring hovered cell to front
  }

  .day-number {
    font-size: 1.2rem;
    font-weight: ${props => props.$isToday ? 'bold' : 'normal'};
    color: ${props => props.$isToday ? theme.colors.primary : (props.$isCurrentMonth ? theme.colors.textPrimary : theme.colors.textSecondary)};
    width: 100%;
    text-align: right;
    padding: ${theme.spacing.xs};
    span {
      display: inline-block;
      width: 28px;
      height: 28px;
      line-height: 28px;
      border-radius: 50%;
      text-align: center;
    }
  }

  .tasks-list {
    flex-grow: 1;
    width: 100%;
    overflow-y: hidden; // Prevent individual cell scroll in month view
    .task-item {
      font-size: 0.7rem;
      padding: 2px 4px;
      margin-bottom: 2px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      background-color: ${props => props.color || theme.colors.primary}20;
      color: ${theme.colors.textPrimary};
      border-left: 3px solid ${props => props.color || theme.colors.primary};
    }
    .more-tasks {
        font-size: 0.7rem;
        color: ${theme.colors.textSecondary};
        margin-top: ${theme.spacing.xs};
        text-align: center;
        width: 100%;
    }
  }

  @media (max-width: 768px) {
    min-height: 100px;
    .day-number {
      font-size: 1rem;
      span {
        width: 24px;
        height: 24px;
        line-height: 24px;
      }
    }
    .tasks-list .task-item {
      font-size: 0.65rem;
    }
  }
`;

const MonthView: React.FC<MonthViewProps> = ({ days, tasks, onDayClick, onTaskClick }) => {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <MonthGrid>
      <div className="weekdays-header">
        {dayNames.map(dayName => (
          <span key={dayName}>{dayName}</span>
        ))}
      </div>
      {days.map((dayInfo, index) => {
        const dayTasks = tasks.filter(task => isSameDay(task.date, dayInfo.date));
        const displayedTasks = dayTasks.slice(0, 2); // Show max 2 tasks
        const remainingTasksCount = dayTasks.length - displayedTasks.length;

        return (
          <DayCell
            key={index}
            $isCurrentMonth={dayInfo.isCurrentMonth}
            $isToday={dayInfo.isToday}
            $hasTasks={dayTasks.length > 0}
            onClick={() => onDayClick(dayInfo.date)}
          >
            <div className="day-number">
              <span>{format(dayInfo.date, 'd')}</span>
            </div>
            <div className="tasks-list">
              {displayedTasks.map(task => (
                <div key={task.id}
                className="task-item" 
                style={{ backgroundColor: task.color + '20', borderLeftColor: task.color }}
                onClick={(e) => {
                   e.stopPropagation();
                   e.preventDefault();
                   onTaskClick(task);
                }}>
                  {task.isAllDay ? task.title : `${task.startTime} ${task.title}`}
                </div>
              ))}
              {remainingTasksCount > 0 && (
                <div className="more-tasks">
                  +{remainingTasksCount} mais
                </div>
              )}
            </div>
          </DayCell>
        );
      })}
    </MonthGrid>
  );
};

export default MonthView;
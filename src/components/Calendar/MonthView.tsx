// src/components/Calendar/MonthView.tsx
import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import type { DayInfo, Task } from '../../types';
import { Card } from '../Common';

interface MonthViewProps {
  days: DayInfo[];
  onDayClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: ${({ theme }) => theme.colors.border}; // Grid lines
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden; // Ensures corners are rounded
  height: 100%;

  .weekdays-header {
    display: contents; // Makes children act as direct grid items
    span {
      background-color: ${({ theme }) => theme.colors.surface};
      padding: ${({ theme }) => theme.spacing.sm};
      text-align: center;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.primary};
      font-size: 0.9rem;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border};
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const DayCell = styled(Card)<{ $isCurrentMonth: boolean; $isToday: boolean; $hasTasks: boolean; }>`
  min-height: 120px;
  height: 100%;
  background-color: ${props => props.$isCurrentMonth ? props.theme.colors.surface : props.theme.colors.background};
  color: ${props => props.$isCurrentMonth ? props.theme.colors.textPrimary : props.theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: background-color 0.2s ease, transform 0.1s ease;
  border: ${props => props.$isToday ? `2px solid ${props.theme.colors.primary}` : `1px solid ${props.theme.colors.border}`};
  box-shadow: none;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}08;
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.boxShadow};
    z-index: 1;
  }

  .day-number {
    font-size: 1rem;
    font-weight: ${props => props.$isToday ? 'bold' : 'normal'};
    color: ${props => props.$isToday ? props.theme.colors.primary : (props.$isCurrentMonth ? props.theme.colors.textPrimary : props.theme.colors.textSecondary)};
    width: 100%;
    text-align: right;
    padding: 2px;
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
    overflow-y: hidden;
    .more-tasks {
        font-size: 0.7rem;
        color: ${({ theme }) => theme.colors.textSecondary};
        margin-top: ${({ theme }) => theme.spacing.xs};
        text-align: center;
        width: 100%;
    }
  }

  @media (max-width: 768px) {
    min-height: 100px;
    .day-number {
      font-size: 0.8rem;
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

  @media (max-width: 480px) {
    min-height: 80px;
    .day-number { font-size: 0.7rem; }
    .tasks-list .task-item {
      padding: 1px 2px;
    }
  }
`;

const TaskItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  padding: 2px 4px;
  margin-bottom: 2px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: ${props => props.$color}20;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-left: 3px solid ${props => props.$color};
`;

const TaskTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
`;

const AvatarStack = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;

  @media (max-width: 480px) {
    display: none; // Oculta avatares em telas muito pequenas
  }
`;

const Avatar = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid white;
  margin-left: -6px;
  
  &:first-child {
    margin-left: 0;
  }
`;

const MonthView: React.FC<MonthViewProps> = ({ days, onDayClick, onTaskClick }) => {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <MonthGrid>
      <div className="weekdays-header">
        {dayNames.map(dayName => (
          <span key={dayName}>{dayName}</span>
        ))}
      </div>
      {days.map((dayInfo, index) => {
        const dayTasks = dayInfo.tasks;
        const displayedTasks = dayTasks.slice(0, 2);
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
                <TaskItem
                  key={task.id}
                  $color={String(task.color)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                >
                  <TaskTitle>
                    {task.isAllDay ? task.title : `${task.startTime} ${task.title}`}
                  </TaskTitle>
                  <AvatarStack>
                    {task.users?.slice(0, 2).map(user => (
                      <Avatar key={user.id} src={user.avatarUrl} alt={user.name} title={user.name} />
                    ))}
                  </AvatarStack>
                </TaskItem>
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
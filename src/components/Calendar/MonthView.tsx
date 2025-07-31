// src/components/Calendar/MonthView.tsx
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { format, isSameDay } from 'date-fns';
import type { DayInfo, Task } from '../../types';
import { Card } from '../Common';
import EventTooltip from './EventTooltip';
import UserAvatar from './UserAvatar';

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

const TaskItem = styled.div<{ $color: string; $isContinuation: boolean; }>`
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
  border-left: 3px ${props => props.$isContinuation ? 'dashed' : 'solid'} ${props => props.$color};
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

const MonthView: React.FC<MonthViewProps> = ({ days, onDayClick, onTaskClick }) => {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (task: Task, event: React.MouseEvent) => {
    setHoveredTask(task);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredTask(null);
  };

  // 4. useEffect para calcular a posição do tooltip
  useEffect(() => {
    if (hoveredTask && tooltipRef.current) {
      const tooltipElement = tooltipRef.current;
      const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
      const { width: tooltipWidth, height: tooltipHeight } = tooltipElement.getBoundingClientRect();
      const offset = 15; // Pequeno espaço entre o cursor e o tooltip

      let top = mousePosition.y + offset;
      let left = mousePosition.x + offset;

      // Verifica se o tooltip ultrapassa a borda inferior da tela
      if (top + tooltipHeight > windowHeight) {
        // Se sim, posiciona o tooltip acima do cursor
        top = mousePosition.y - tooltipHeight - offset;
      }

      // Verifica se o tooltip ultrapassa a borda direita da tela
      if (left + tooltipWidth > windowWidth) {
        // Se sim, alinha o tooltip à direita do cursor
        left = mousePosition.x - tooltipWidth - offset;
      }
      
      // Garante que o tooltip não saia pela esquerda ou topo
      if (top < 0) top = offset;
      if (left < 0) left = offset;

      setTooltipPosition({ top, left });
    } else {
        // Esconde o tooltip quando não há tarefa hoverada
        setTooltipPosition({ top: -9999, left: -9999 });
    }
  }, [hoveredTask, mousePosition]);

  return (
    <>
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
                {displayedTasks.map(task => {
                  const isContinuation = !isSameDay(new Date(task.date), dayInfo.date);
                  return (
                      <TaskItem
                          key={task.id}
                          $color={String(task.color)}
                          $isContinuation={isContinuation}
                          onClick={(e) => {
                              e.stopPropagation();
                              onTaskClick(task);
                          }}
                          onMouseEnter={(e) => handleMouseEnter(task, e)}
                          onMouseLeave={handleMouseLeave}
                      >
                      <TaskTitle>
                          {task.isAllDay || isContinuation ? task.title : `${task.startTime} ${task.title}`}
                      </TaskTitle>
                      <AvatarStack>
                          {task.users?.slice(0, 2).map(user => (
                            <UserAvatar key={user.id} user={user} />
                          ))}
                      </AvatarStack>
                      </TaskItem>
                  );
                })}
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
      {hoveredTask && (
        <EventTooltip 
          ref={tooltipRef} 
          task={hoveredTask} 
          position={tooltipPosition} 
        />
      )}
    </>
  );
};

export default MonthView;
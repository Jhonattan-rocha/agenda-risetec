// src/components/Calendar/TaskViewByDate.tsx
import React from 'react';
import styled from 'styled-components';
import type { Task } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '../Common';
import { formatTime } from '../../utils/dateUtils';

interface TaskViewByDateProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const TaskViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  max-height: calc(100vh - 200px); // Adjust based on header height
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius};
`;

const DateSection = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surface};
  border-left: 5px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
`;

const SectionHeader = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
`;

const TaskItem = styled.div<{ $color?: string }>`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .color-indicator {
    width: 6px;
    height: 100%; // Takes full height of item
    background-color: ${props => props.$color || props.theme.colors.primary};
    margin-right: ${({ theme }) => theme.spacing.sm};
    border-radius: 3px;
    flex-shrink: 0;
  }

  .task-content {
    flex-grow: 1;
    h4 {
      margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
      font-size: 1rem;
      color: ${({ theme }) => theme.colors.textPrimary};
    }
    p {
      margin: 0;
      font-size: 0.85rem;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
    span {
        font-size: 0.8rem;
        color: ${({ theme }) => theme.colors.textPrimary};
        font-weight: 500;
        margin-right: ${({ theme }) => theme.spacing.xs};
    }
  }
`;

const NoTasksMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const TaskViewByDate: React.FC<TaskViewByDateProps> = ({ tasks, onTaskClick }) => {
  // Group tasks by date
  const groupedTasks: { [key: string]: Task[] } = tasks.reduce((acc, task) => {
    const dateKey = format(task.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as { [key: string]: Task[] });

  // Sort dates
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <TaskViewContainer>
      {sortedDates.length > 0 ? (
        sortedDates.map(dateKey => {
          const date = new Date(dateKey);
          const tasksForDate = groupedTasks[dateKey].sort((a, b) => {
            if (a.isAllDay && !b.isAllDay) return -1;
            if (!a.isAllDay && b.isAllDay) return 1;
            if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
            return 0;
          });

          return (
            <DateSection key={dateKey}>
              <SectionHeader>{format(date, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}</SectionHeader>
              <div>
                {tasksForDate.map(task => (
                  <TaskItem key={task.id} $color={task.color} onClick={() => onTaskClick?.(task)}>
                    <div className="color-indicator" />
                    <div className="task-content">
                      <h4>{task.title}</h4>
                      <p>
                        {task.isAllDay ? 'Dia todo' : (task.startTime && task.endTime ? `${formatTime(task.startTime)} - ${formatTime(task.endTime)}` : 'Horário não especificado')}
                        {task.description && ` | ${task.description}`}
                      </p>
                    </div>
                  </TaskItem>
                ))}
              </div>
            </DateSection>
          );
        })
      ) : (
        <NoTasksMessage>Nenhuma tarefa agendada.</NoTasksMessage>
      )}
    </TaskViewContainer>
  );
};

export default TaskViewByDate;
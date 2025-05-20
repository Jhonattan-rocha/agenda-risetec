// src/components/RightSidebar/UpcomingTasks.tsx
import React from 'react';
import styled from 'styled-components';
import { Card } from '../Common';
import type { Task } from '../../types';
import { format, isFuture, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { theme } from '../../styles/theme';

interface UpcomingTasksProps {
  tasks: Task[];
  onTaskClik: (task: Task) => void;
}

const UpcomingTasksContainer = styled(Card)`
  padding: ${theme.spacing.md};
  h3 {
    margin-top: 0;
    font-size: 1.1rem;
    color: ${theme.colors.textPrimary};
  }
  .task-list {
    max-height: 300px;
    overflow-y: auto;
    padding-right: ${theme.spacing.xs}; // For scrollbar
  }
`;

const TaskItemWrapper = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px dashed ${theme.colors.border};
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
  .color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => props.$color || theme.colors.primary};
    margin-right: ${theme.spacing.sm};
    flex-shrink: 0;
  }
  .task-details {
    flex-grow: 1;
    h4 {
      font-size: 0.95rem;
      margin: 0;
      color: ${theme.colors.textPrimary};
    }
    p {
      font-size: 0.8rem;
      color: ${theme.colors.textSecondary};
      margin: 0;
    }
  }
`;

const NoTasksMessage = styled.p`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
  text-align: center;
  padding: ${theme.spacing.md} 0;
`;

const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ tasks, onTaskClik }) => {
  const sortedTasks = tasks
    .filter(task => isFuture(task.date) || isToday(task.date))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <UpcomingTasksContainer>
      <h3>Próximas Tarefas</h3>
      {sortedTasks.length > 0 ? (
        <div className="task-list">
          {sortedTasks.map(task => (
            <TaskItemWrapper key={task.id} $color={task.color} onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onTaskClik?.(task);
            }}>
              <div className="color-dot" />
              <div className="task-details">
                <h4>{task.title}</h4>
                <p>
                  {format(task.date, 'dd MMM', { locale: ptBR })}
                  {task.startTime && ` às ${task.startTime}`}
                </p>
              </div>
            </TaskItemWrapper>
          ))}
        </div>
      ) : (
        <NoTasksMessage>Nenhuma tarefa futura agendada.</NoTasksMessage>
      )}
    </UpcomingTasksContainer>
  );
};

export default UpcomingTasks;
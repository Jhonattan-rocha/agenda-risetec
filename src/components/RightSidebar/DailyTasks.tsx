// src/components/RightSidebar/DailyTasks.tsx
import React from 'react';
import styled from 'styled-components';
import { Card } from '../Common';
import type { Task } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { theme } from '../../styles/theme';

interface DailyTasksProps {
  tasks: Task[];
  onTaskClik: (task: Task) => void;
}

const DailyTasksContainer = styled(Card)`
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

const DailyTasks: React.FC<DailyTasksProps> = ({ tasks, onTaskClik }) => {
  const sortedTasks: Array<Task> = [...tasks];

  sortedTasks.sort((a, b) => {
    const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateDiff !== 0) return dateDiff;

    const startDiff = String(a.startTime).localeCompare(String(b.startTime));
    if (startDiff !== 0) return startDiff;

    return String(a.endTime).localeCompare(String(b.endTime));
  });

  return (
    <DailyTasksContainer>
      <h3>Tarefas Do Dia</h3>
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
    </DailyTasksContainer>
  );
};

export default DailyTasks;
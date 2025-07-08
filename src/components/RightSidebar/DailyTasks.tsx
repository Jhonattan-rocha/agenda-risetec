// src/components/RightSidebar/DailyTasks.tsx
import React from 'react';
import styled from 'styled-components';
import { Card } from '../Common';
import type { Task } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaCheckCircle, FaQuestionCircle, FaTimesCircle } from 'react-icons/fa';

interface DailyTasksProps {
  tasks: Task[];
  onTaskClik: (task: Task) => void;
}

const DailyTasksContainer = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md};
  h3 {
    margin-top: 0;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  .task-list {
    max-height: 300px;
    overflow-y: auto;
    padding-right: ${({ theme }) => theme.spacing.xs}; // For scrollbar
  }
`;

// ATUALIZADO: Adiciona a prop $isCancelled para estilização condicional
const TaskItemWrapper = styled.div<{ $color?: string; $isCancelled?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
  cursor: pointer;
  
  // NOVO: Aplica estilo para tarefas canceladas
  opacity: ${({ $isCancelled }) => ($isCancelled ? 0.6 : 1)};
  text-decoration: ${({ $isCancelled }) => ($isCancelled ? 'line-through' : 'none')};

  &:last-child {
    border-bottom: none;
  }
  .color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => props.$color || props.theme.colors.primary};
    margin-right: ${({ theme }) => theme.spacing.sm};
    flex-shrink: 0;
  }
  .task-details {
    flex-grow: 1;
    h4 {
      font-size: 0.95rem;
      margin: 0;
      color: ${({ theme }) => theme.colors.textPrimary};
      // NOVO: Flex para alinhar ícone e texto
      display: flex;
      align-items: center;
      gap: 6px;
    }
    p {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      margin: 0;
      padding-left: 16px; // Alinha com o texto do título
    }
  }
`;

const NoTasksMessage = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

// NOVO: Componente para renderizar o ícone de status
const StatusIcon: React.FC<{ status?: string }> = ({ status }) => {
    switch (status) {
        case 'confirmed': return <FaCheckCircle size={12} color="green" title="Confirmado" />;
        case 'tentative': return <FaQuestionCircle size={12} color="orange" title="Pendente" />;
        case 'cancelled': return <FaTimesCircle size={12} color="red" title="Cancelado" />;
        default: return null;
    }
};

const DailyTasks: React.FC<DailyTasksProps> = ({ tasks, onTaskClik }) => {
  // A ordenação já está correta
  const sortedTasks: Array<Task> = [...tasks].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    // Primeiro, ordena por data
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
  
    // Se as datas forem iguais, ordena por hora de início
    const startA = a.startTime || '';
    const startB = b.startTime || '';
    return startA.localeCompare(startB);
  });

  return (
    <DailyTasksContainer>
      <h3>Tarefas Do Dia</h3>
      {sortedTasks.length > 0 ? (
        <div className="task-list">
          {sortedTasks.map(task => (
            <TaskItemWrapper 
              key={task.id} 
              $color={task.color} 
              // ATUALIZADO: Passa a prop para o styled component
              $isCancelled={task.status === 'cancelled'}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onTaskClik?.(task);
              }}>
              <div className="color-dot" />
              <div className="task-details">
                <h4>
                  {/* NOVO: Renderiza o ícone de status */}
                  <StatusIcon status={task.status} />
                  {task.title}
                </h4>
                <p>
                  {format(new Date(task.date), 'dd MMM', { locale: ptBR })}
                  {task.startTime && ` às ${task.startTime}`}
                </p>
              </div>
            </TaskItemWrapper>
          ))}
        </div>
      ) : (
        <NoTasksMessage>Nenhuma tarefa para hoje.</NoTasksMessage>
      )}
    </DailyTasksContainer>
  );
};

export default DailyTasks;
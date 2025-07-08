// src/components/Calendar/TaskViewByDate.tsx
import React from 'react';
import styled from 'styled-components';
import type { Task } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '../Common';
import { formatTime } from '../../utils/dateUtils';
// NOVO: Ícones para status e localização
import { FaMapMarkerAlt, FaCheckCircle, FaQuestionCircle, FaTimesCircle } from 'react-icons/fa';

interface TaskViewByDateProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const TaskViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  max-height: calc(100vh - 200px); 
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

const TaskItem = styled.div<{ $color?: string; $isCancelled?: boolean }>`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  // NOVO: Estilo para tarefas canceladas
  opacity: ${({ $isCancelled }) => ($isCancelled ? 0.6 : 1)};
  text-decoration: ${({ $isCancelled }) => ($isCancelled ? 'line-through' : 'none')};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .task-content {
    flex-grow: 1;
    margin-left: ${({ theme }) => theme.spacing.sm};
    h4 {
      margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
      font-size: 1rem;
      color: ${({ theme }) => theme.colors.textPrimary};
      display: flex;
      align-items: center;
      gap: 8px;
    }
    p {
      margin: 0;
      font-size: 0.85rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }
  }
`;

const ColorIndicator = styled.div<{ $color?: string }>`
    width: 6px;
    min-height: 50px; // Garante uma altura mínima
    background-color: ${props => props.$color || props.theme.colors.primary};
    border-radius: 3px;
    flex-shrink: 0;
`;

// NOVO: Componente para renderizar o ícone de status
const StatusIcon: React.FC<{ status?: string }> = ({ status }) => {
    switch (status) {
        case 'confirmed': return <FaCheckCircle color="green" title="Confirmado" />;
        case 'tentative': return <FaQuestionCircle color="orange" title="Pendente" />;
        case 'cancelled': return <FaTimesCircle color="red" title="Cancelado" />;
        default: return null;
    }
};

const NoTasksMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const TaskViewByDate: React.FC<TaskViewByDateProps> = ({ tasks, onTaskClick }) => {
  const groupedTasks: { [key: string]: Task[] } = tasks.reduce((acc, task) => {
    const dateKey = format(new Date(task.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as { [key: string]: Task[] });

  const sortedDates = Object.keys(groupedTasks).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <TaskViewContainer>
      {sortedDates.length > 0 ? (
        sortedDates.map(dateKey => {
          const date = new Date(dateKey + 'T12:00:00'); // Evita problemas de fuso
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
                  <TaskItem 
                    key={task.id} 
                    $color={task.color} 
                    $isCancelled={task.status === 'cancelled'}
                    onClick={() => onTaskClick?.(task)}
                  >
                    <ColorIndicator $color={task.color} />
                    <div className="task-content">
                      <h4>
                        <StatusIcon status={task.status} />
                        {task.title}
                      </h4>
                      <p>
                        <strong>
                          {task.isAllDay ? 'Dia todo' : (task.startTime && task.endTime ? `${formatTime(task.startTime)} - ${formatTime(task.endTime)}` : 'Horário não especificado')}
                        </strong>
                      </p>
                      {/* ATUALIZADO: Exibe a localização se existir */}
                      {task.location && (
                        <p>
                          <FaMapMarkerAlt /> {task.location}
                        </p>
                      )}
                      {task.description && <p style={{ fontStyle: 'italic', marginTop: '6px' }}>{task.description}</p>}
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
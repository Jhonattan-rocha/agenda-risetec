// src/data/mockTasks.tsx
import type { Task, User } from '../types';

// Dados de exemplo para usuários
const mockUsers: User[] = [
  { id: 'user-1', name: 'Alice', email: 'alice@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=alice', profile_id: '' },
  { id: 'user-2', name: 'Bruno', email: 'bruno@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=bruno', profile_id: '' },
  { id: 'user-3', name: 'Carla', email: 'carla@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=carla', profile_id: '' },
];

const createDate = (year: number, month: number, day: number) => new Date(year, month - 1, day);

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Reunião de Equipe',
    description: 'Reunião semanal para discutir o progresso do projeto X.',
    date: createDate(2025, 5, 17),
    startTime: '10:00',
    endTime: '11:00',
    color: '#FFDDC1',
    calendar_id: 'cal-1',
    users: [mockUsers[0], mockUsers[1]]
  },
  {
    id: '2',
    title: 'Entrega do Relatório',
    description: 'Finalizar e enviar o relatório de desempenho do último mês.',
    date: createDate(2025, 5, 20),
    isAllDay: true,
    color: '#D4E8D4',
    calendar_id: 'cal-1',
    users: [mockUsers[0]]
  },
  {
    id: '3',
    title: 'Consulta Médica',
    date: createDate(2025, 5, 22),
    startTime: '14:30',
    endTime: '15:30',
    color: '#C7CEEA',
    calendar_id: 'cal-2',
    users: [mockUsers[2]]
  },
  {
    id: '4',
    title: 'Planejamento de Marketing',
    description: 'Sessão de brainstorm para a nova campanha.',
    date: createDate(2025, 5, 25),
    startTime: '09:00',
    endTime: '12:00',
    color: '#AED6F1',
    calendar_id: 'cal-1',
    users: [mockUsers[1], mockUsers[2]]
  },
];
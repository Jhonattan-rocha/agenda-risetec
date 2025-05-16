// src/data/mockTasks.ts
import type { Task } from '../types';

const createDate = (year: number, month: number, day: number) => new Date(year, month - 1, day);

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Reunião de Equipe',
    description: 'Reunião semanal para discutir o progresso do projeto X.',
    date: createDate(2025, 5, 17),
    startTime: '10:00',
    endTime: '11:00',
    color: '#FFDDC1', // Peach
  },
  {
    id: '2',
    title: 'Entrega do Relatório Mensal',
    description: 'Finalizar e enviar o relatório de desempenho do último mês.',
    date: createDate(2025, 5, 20),
    isAllDay: true,
    color: '#D4E8D4', // Light Green
  },
  {
    id: '3',
    title: 'Consulta Médica',
    date: createDate(2025, 5, 22),
    startTime: '14:30',
    endTime: '15:30',
    color: '#C7CEEA', // Lavender
  },
  {
    id: '4',
    title: 'Aula de Yoga',
    date: createDate(2025, 5, 17),
    startTime: '18:00',
    endTime: '19:00',
    color: '#F0E68C', // Khaki
  },
  {
    id: '5',
    title: 'Planejamento de Marketing',
    description: 'Sessão de brainstorm para a nova campanha.',
    date: createDate(2025, 5, 25),
    startTime: '09:00',
    endTime: '12:00',
    color: '#AED6F1', // Light Blue
  },
  {
    id: '6',
    title: 'Aniversário da Maria',
    date: createDate(2025, 5, 28),
    isAllDay: true,
    color: '#FFC0CB', // Pink
  },
  {
    id: '7',
    title: 'Revisar Código',
    description: 'Revisão do PR de funcionalidade de login.',
    date: createDate(2025, 5, 17),
    startTime: '11:30',
    endTime: '12:30',
    color: '#AFEEEE', // Pale Turquoise
  },
  {
    id: '8',
    title: 'Fazer Compras',
    date: createDate(2025, 5, 19),
    isAllDay: true,
    color: '#E6E6FA', // Lavender (light)
  },
  {
    id: '9',
    title: 'Webinar de IA',
    date: createDate(2025, 6, 5), // Next month task
    startTime: '16:00',
    endTime: '17:00',
    color: '#B0C4DE', // Light Steel Blue
  },
  {
    id: '10',
    title: 'Fitness',
    date: createDate(2025, 5, 20),
    startTime: '07:00',
    endTime: '08:00',
    color: '#87CEEB', // Sky Blue
  },
];
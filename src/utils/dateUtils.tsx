// src/utils/dateUtils.ts
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  parseISO,
  isToday as checkIsToday,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Task, DayInfo } from '../types';

export const getMonthDays = (date: Date): DayInfo[] => {
  const startDay = startOfWeek(startOfMonth(date), { locale: ptBR });
  const endDay = endOfWeek(endOfMonth(date), { locale: ptBR });

  const days: DayInfo[] = [];
  let day = startDay;

  while (day <= endDay) {
    days.push({
      date: day,
      isCurrentMonth: isSameMonth(day, date),
      isToday: checkIsToday(day),
      tasks: [], // Tasks will be added separately
    });
    day = addDays(day, 1);
  }
  return days;
};

export const getWeekDays = (date: Date): DayInfo[] => {
  const startDay = startOfWeek(date, { locale: ptBR });
  const days: DayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const currentDay = addDays(startDay, i);
    days.push({
      date: currentDay,
      isCurrentMonth: true, // For week view, all are "current"
      isToday: checkIsToday(currentDay),
      tasks: [],
    });
  }
  return days;
};

export const getDayInfo = (date: Date): DayInfo => {
  return {
    date,
    isCurrentMonth: true,
    isToday: checkIsToday(date),
    tasks: [],
  };
};

export const getDayName = (date: Date, short = false): string => {
  return format(date, short ? 'EEE' : 'EEEE', { locale: ptBR });
};

export const getMonthName = (date: Date, short = false): string => {
  return format(date, short ? 'MMM' : 'MMMM', { locale: ptBR });
};

export const formatFullDate = (date: Date): string => {
  return format(date, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(`2000-01-01T${date}`) : date;
  return format(d, 'HH:mm', { locale: ptBR });
};

export const getTasksForDate = (tasks: Task[], date: Date): Task[] => {
    const dayStart = startOfDay(date);

    return tasks.filter(task => {
        const taskStart = startOfDay(new Date(task.date));
        
        // Se for um evento de dia único (sem endDate)
        if (!task.endDate) {
            return isSameDay(taskStart, dayStart);
        }
        
        const taskEnd = endOfDay(new Date(task.endDate));
        
        // Se for um evento de múltiplos dias, verifica se o dia atual está no intervalo
        return isWithinInterval(dayStart, { start: taskStart, end: taskEnd });
    }).sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
        return 0;
    });
};

export const getDaysInMonth = (date: Date): DayInfo[] => {
    const days: DayInfo[] = [];
    const startOfSelectedMonth = startOfMonth(date);
    const endOfSelectedMonth = endOfMonth(date);

    let currentDay = startOfSelectedMonth;
    while (currentDay <= endOfSelectedMonth) {
        days.push({
            date: currentDay,
            isCurrentMonth: true,
            isToday: checkIsToday(currentDay),
            tasks: [],
        });
        currentDay = addDays(currentDay, 1);
    }
    return days;
};

// Objeto com as traduções para pt-BR
const ptBrTranslations = {
    'every': 'a cada',
    'day': 'dia',
    'days': 'dias',
    'week': 'semana',
    'weeks': 'semanas',
    'month': 'mês',
    'months': 'meses',
    'year': 'ano',
    'years': 'anos',
    'on': 'em',
    'in': 'em',
    'on the': 'no',
    'and': 'e',
    'or': 'ou',
    'the': 'o',
    'st': 'º',
    'nd': 'º',
    'rd': 'º',
    'th': 'º',
    // Dias da semana
    'Sunday': 'Domingo',
    'Monday': 'Segunda-feira',
    'Tuesday': 'Terça-feira',
    'Wednesday': 'Quarta-feira',
    'Thursday': 'Quinta-feira',
    'Friday': 'Sexta-feira',
    'Saturday': 'Sábado',
    '0': 'Domingo',
    '1': 'Segunda-feira',
    '2': 'Terça-feira',
    '3': 'Quarta-feira',
    '4': 'Quinta-feira',
    '5': 'Sexta-feira',
    '6': 'Sábado',
    // Meses
    'January': 'Janeiro',
    'February': 'Fevereiro',
    'March': 'Março',
    'April': 'Abril',
    'May': 'Maio',
    'June': 'Junho',
    'July': 'Julho',
    'August': 'Agosto',
    'September': 'Setembro',
    'October': 'Outubro',
    'November': 'Novembro',
    'December': 'Dezembro',
    // Para a frase "until..."
    ', until %s': ', até %s',
    // Para a frase "for..."
    ', %d times': ', %d vezes',
};

// Função que a biblioteca rrule usará para obter as traduções
const getText = (str: string): string => {
    return (ptBrTranslations as any)[str] || str;
}

// src/utils/getInitials.ts
const getInitials = (name: string): string => {
  if (!name) return '?';

  const names = name.trim().split(' ');
  const initials = names.map(n => n[0]).join('');

  if (initials.length > 2) {
    return initials[0] + initials[initials.length - 1];
  }

  return initials.toUpperCase();
};

export { addMonths, subMonths, isSameDay, format, getDay, startOfWeek, ptBR, getText, getInitials };
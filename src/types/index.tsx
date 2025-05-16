// src/types/index.ts

export type ViewMode = 'month' | 'week' | 'day' | 'tasks';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: Date;
  isAllDay?: boolean;
  startTime?: string; // e.g., "09:00"
  endTime?: string;   // e.g., "10:00"
  color?: string;     // e.g., "#FFDDC1"
}

export interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}
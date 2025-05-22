// src/types/index.ts

export type ViewMode = 'month' | 'week' | 'day' | 'tasks';

export interface Calendar {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  tasks: Array<Task>
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: Date;
  isAllDay?: boolean;
  startTime?: string; // e.g., "09:00"
  endTime?: string;   // e.g., "10:00"
  color?: string;     // e.g., "#FFDDC1"
  calendar_id: string;
  user_id: string;
}

export interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

export interface Profile {
  id: string;
  name: string;
  permissions: Array<{id: string; entity_name: string; can_view: boolean; can_delete: boolean; can_update: boolean; can_create: boolean;}>
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  profile_id: string;

}
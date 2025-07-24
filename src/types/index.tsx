// src/types/index.tsx

export type ViewMode = 'month' | 'week' | 'day' | 'tasks';

export interface Calendar {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  tasks: Array<Task>;
  description?: string;
  is_private?: boolean;
  owner_id?: string;
}

export interface Task {
  id: string; // Este continuará sendo o ID único da ocorrência (ex: "1-recur-0")
  originalId?: string; // NOVO CAMPO: Guardará o ID original do banco (ex: "1")
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  color?: string;
  calendar_id: string;
  users: User[];
  location?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  recurring_rule?: string;
  created_by?: string;
}

export interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

export interface Permission {
  id: string; 
  entity_name: string; 
  can_view: boolean; 
  can_delete: boolean; 
  can_update: boolean; 
  can_create: boolean;
  profile_id: string;
}

export interface Profile {
  id: string;
  name: string;
  permissions: Array<Permission>
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  profile_id: string;
  avatarUrl: string;
  phone_number?: string;
  last_login?: Date;
}
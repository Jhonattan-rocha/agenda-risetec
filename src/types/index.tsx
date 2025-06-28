// src/types/index.tsx

export type ViewMode = 'month' | 'week' | 'day' | 'tasks';

export interface Calendar {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  tasks: Array<Task>
}

// MODIFICADO: A tarefa agora pode ter múltiplos usuários.
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
  users: User[]; // MODIFICADO: De user_id: string para users: User[]
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

// MODIFICADO: O usuário agora tem uma URL de avatar.
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Senha é opcional no frontend
  profile_id: string;
  avatarUrl: string; // NOVO: URL para a foto de perfil do usuário.
}
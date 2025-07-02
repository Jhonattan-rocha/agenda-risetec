// src/hooks/usePermission.ts
import type { Profile, Permission } from '../types';

// O tipo de ação que queremos verificar
type PermissionAction = 'view' | 'create' | 'update' | 'delete';

// O hook recebe a ação e a entidade (que pode ser genérica ou específica)
export const usePermission = (action: PermissionAction, entity: string, profile: Profile): boolean => {
  // 1. Pega o perfil do usuário logado diretamente do Redux

  if (!profile) {
    return false;
  }

  // Se o usuário for um super admin (ex: perfil com nome 'Admin'), concede todas as permissões.
  // Esta é uma maneira simples de ter um superusuário.
  if (profile.name === 'Admin') {
    return true;
  }

  // 2. Extrai as permissões do perfil
  const permissions = profile.permissions || [];

  // 3. Lógica de verificação centralizada
  const permissionKey: keyof Omit<Permission, 'id' | 'entity_name' | 'profile_id'> = `can_${action}`;

  // 4. Verifica a permissão de "Super Admin" para o tipo de entidade
  // Ex: Se a entidade for 'calendar_123', verifica se há permissão para 'calendars'
  const entityType = entity.split('_')[0]; // ex: 'calendars'
  const adminPermission = permissions.find(p => p.entity_name === entityType);
  if (adminPermission && adminPermission[permissionKey]) {
    return true; // Se tem a permissão de admin para o tipo, concede acesso
  }

  // 5. Se não for admin, verifica a permissão específica para a entidade
  const specificPermission = permissions.find(p => p.entity_name === entity);
  if (specificPermission && specificPermission[permissionKey]) {
    return true; // Se tem a permissão específica, concede acesso
  }

  // 6. Se nenhuma permissão for encontrada, nega o acesso
  return false;
};
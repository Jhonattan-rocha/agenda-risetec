import { useSelector } from 'react-redux';
import type { AuthState } from '../store/modules/types';
import type { Profile, Permission } from '../types';

// O tipo de ação que queremos verificar
type PermissionAction = 'view' | 'create' | 'update' | 'delete';

// O hook recebe a ação e a entidade (que pode ser genérica ou específica)
export const usePermission = (action: PermissionAction, entity: string): boolean => {
  // 1. Pega o perfil do usuário logado diretamente do Redux
  const profile: Profile | null = useSelector((state: { authreducer: AuthState }) => state.authreducer.user.profile);
  console.log(profile)
  if (!profile) {
    return false;
  }

  // 2. Extrai as permissões do perfil
  const permissions = profile.permissions || [];

  // 3. Lógica de verificação centralizada
  
  // Converte a ação do hook para a chave correspondente no objeto de permissão
  const permissionKey: keyof Omit<Permission, 'id' | 'entity_name'> = `can_${action}`;

  // 4. Verifica a permissão de "Super Admin" para a entidade principal
  // Ex: Se a entidade for 'calendar_123', verifica se há permissão para 'calendars'
  const entityType = entity.split('_')[0]; // 'calendar'
  const adminPermission = permissions.find(p => p.entity_name === entityType);
  if (adminPermission && adminPermission[permissionKey]) {
    return true; // Se tem a permissão de admin, concede acesso
  }

  // 5. Se não for admin, verifica a permissão específica
  const specificPermission = permissions.find(p => p.entity_name === entity);
  if (specificPermission && specificPermission[permissionKey]) {
    return true; // Se tem a permissão específica, concede acesso
  }

  // 6. Se nenhuma permissão for encontrada, nega o acesso
  return false;
};
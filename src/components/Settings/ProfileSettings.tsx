// src/components/Settings/ProfileManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Card, Button } from '../Common';
import { theme } from '../../styles/theme';
import type { Profile, Permission } from '../../types';
import api from '../../services/axios';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import ActivityIndicator from '../ActivityIndicator';
import { FaPlus } from 'react-icons/fa';

// --- ESTILOS ---

const ProfileLayout = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  min-height: 500px;
`;

const ProfileListContainer = styled(Card)`
  flex: 0 0 250px;
  padding: ${theme.spacing.sm};
  h3 {
    margin-top: ${theme.spacing.xs};
    margin-bottom: ${theme.spacing.md};
    padding: 0 ${theme.spacing.sm};
  }
`;

const ProfileListItem = styled.div<{ $isActive: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius};
  cursor: pointer;
  font-weight: 500;
  color: ${({ $isActive }) => $isActive ? theme.colors.primary : theme.colors.textSecondary};
  background-color: ${({ $isActive }) => $isActive ? `${theme.colors.primary}1A` : 'transparent'};
  
  &:hover {
    background-color: ${`${theme.colors.primary}1A`};
  }
`;

const ProfileFormContainer = styled(Card)`
  flex-grow: 1;
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  margin-bottom: .5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: .75rem;
  border: 1px solid ${theme.colors.border};
  background-color: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  border-radius: ${theme.borderRadius};
  font-size: 1rem;
`;

const PermissionsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  
  th, td {
    padding: ${theme.spacing.sm};
    border-bottom: 1px solid ${theme.colors.border};
  }
  
  th {
    color: ${theme.colors.textSecondary};
    font-size: 0.9rem;
  }
  
  td {
    text-align: center;
  }

  tbody tr:hover {
    background-color: ${theme.colors.background};
  }
`;

const ActionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${theme.spacing.xl};
`;


// --- LÓGICA DO COMPONENTE ---

// Defina as entidades da sua aplicação aqui
const ENTITIES = [
  { key: 'tasks', name: 'Tarefas' },
  { key: 'calendars', name: 'Calendários' },
  { key: 'users', name: 'Usuários' },
  { key: 'profiles', name: 'Perfis' },
  // Adicione outras entidades conforme necessário
];

const ProfileManagement: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Partial<Profile> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  
  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      // Você precisará criar este endpoint na sua API
      const response = await api.get('/user_profile', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProfiles(response.data);
    } catch (error) {
      console.error("Erro ao buscar perfis:", error);
      alert("Não foi possível carregar os perfis.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSelectProfile = (profile: Profile) => {
    // Garante que todas as entidades existam nas permissões do perfil selecionado
    const permissions = ENTITIES.map(entity => {
      const existingPermission = profile.permissions.find(p => p.entity_name === entity.key);
      return existingPermission || { 
        entity_name: entity.key, 
        can_view: false, 
        can_create: false, 
        can_update: false, 
        can_delete: false 
      };
    });
    console.log(permissions);
    // setSelectedProfile({ ...profile, permissions });
  };

  const handleNewProfile = () => {
    // setSelectedProfile({
    //   name: '',
    //   permissions: ENTITIES.map(entity => ({
    //     entity_name: entity.key,
    //     can_view: false,
    //     can_create: false,
    //     can_update: false,
    //     can_delete: false,
    //   })),
    // });
  };

  const handlePermissionChange = (entity_name: string, action: keyof Omit<Permission, 'id' | 'entity_name'>, value: boolean) => {
    if (!selectedProfile) return;

    const updatedPermissions = selectedProfile.permissions?.map(p => 
      p.entity_name === entity_name ? { ...p, [action]: value } : p
    );
    setSelectedProfile({ ...selectedProfile, permissions: updatedPermissions });
  };

  const handleSave = async () => {
    if (!selectedProfile || !selectedProfile.name) {
      alert("O nome do perfil é obrigatório.");
      return;
    }
    setIsLoading(true);
    
    const isEditing = !!selectedProfile.id;
    const url = isEditing ? `/profiles/${selectedProfile.id}` : '/profiles';
    const method = isEditing ? 'put' : 'post';

    try {
      await api[method](url, selectedProfile, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert("Perfil salvo com sucesso!");
      fetchProfiles();
      setSelectedProfile(null);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("Não foi possível salvar o perfil.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedProfile?.id || !window.confirm("Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.")) {
      return;
    }
    setIsLoading(true);
    try {
      await api.delete(`/user_profile/${selectedProfile.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert("Perfil excluído com sucesso!");
      fetchProfiles();
      setSelectedProfile(null);
    } catch (error) {
      console.error("Erro ao excluir perfil:", error);
      alert("Não foi possível excluir o perfil. Verifique se não há usuários associados a ele.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileLayout>
      <ProfileListContainer>
        <h3>Perfis</h3>
        {profiles.map(profile => (
          <ProfileListItem
            key={profile.id}
            $isActive={selectedProfile?.id === profile.id}
            onClick={() => handleSelectProfile(profile)}
          >
            {profile.name}
          </ProfileListItem>
        ))}
        <Button outline onClick={handleNewProfile} style={{ width: '100%', marginTop: '1rem' }}>
          <FaPlus style={{ marginRight: '8px' }}/> Novo Perfil
        </Button>
      </ProfileListContainer>
      
      <ProfileFormContainer>
        {isLoading && !selectedProfile ? <ActivityIndicator/> : null}
        
        {selectedProfile && (
          <>
            <h2>{selectedProfile.id ? 'Editar Perfil' : 'Novo Perfil'}</h2>
            <FormGroup>
              <Label>Nome do Perfil</Label>
              <Input
                type="text"
                value={selectedProfile.name || ''}
                onChange={(e) => setSelectedProfile({ ...selectedProfile, name: e.target.value })}
              />
            </FormGroup>

            <h3>Permissões</h3>
            <PermissionsTable>
              <thead>
                <tr>
                  <th>Entidade</th>
                  <th>Visualizar</th>
                  <th>Criar</th>
                  <th>Editar</th>
                  <th>Excluir</th>
                </tr>
              </thead>
              <tbody>
                {selectedProfile.permissions?.map(permission => (
                  <tr key={permission.entity_name}>
                    <td>{ENTITIES.find(e => e.key === permission.entity_name)?.name}</td>
                    <td><input type="checkbox" checked={permission.can_view} onChange={e => handlePermissionChange(permission.entity_name, 'can_view', e.target.checked)} /></td>
                    <td><input type="checkbox" checked={permission.can_create} onChange={e => handlePermissionChange(permission.entity_name, 'can_create', e.target.checked)} /></td>
                    <td><input type="checkbox" checked={permission.can_update} onChange={e => handlePermissionChange(permission.entity_name, 'can_update', e.target.checked)} /></td>
                    <td><input type="checkbox" checked={permission.can_delete} onChange={e => handlePermissionChange(permission.entity_name, 'can_delete', e.target.checked)} /></td>
                  </tr>
                ))}
              </tbody>
            </PermissionsTable>

            <ActionFooter>
                {selectedProfile.id && <Button danger onClick={handleDelete} disabled={isLoading}>Excluir</Button>}
                <div/> {/* For spacing */}
                <Button primary onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </ActionFooter>
          </>
        )}
      </ProfileFormContainer>
    </ProfileLayout>
  );
};

export default ProfileManagement;
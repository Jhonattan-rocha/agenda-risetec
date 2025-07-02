// src/components/Settings/ProfileManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Card, Button } from '../Common';
import type { Calendar, Permission, Profile } from '../../types';
import api from '../../services/axios';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import ActivityIndicator from '../ActivityIndicator';
import { FaPlus, FaEdit, FaSave, FaTrash } from 'react-icons/fa';
import ProfileModal from './ProfileModal'; // IMPORTA O NOVO MODAL
import { usePermission } from '../../hooks/usePermission'; // Importar hook

// --- ESTILOS ---

const ProfileLayout = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  min-height: 500px;
`;

const ProfileListContainer = styled(Card)`
  flex: 0 0 300px;
  padding: ${({ theme }) => theme.spacing.sm};
  h3 {
    margin-top: ${({ theme }) => theme.spacing.xs};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

const ProfileListItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  font-weight: 500;
  color: ${({ $isActive, theme }) => $isActive ? theme.colors.primary : theme.colors.textSecondary};
  background-color: ${({ $isActive, theme }) => $isActive ? `${theme.colors.primary}1A` : 'transparent'};
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}1A`};
  }
`;

const EditButton = styled(Button)`
  padding: 4px 8px;
  font-size: 0.8rem;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => `${theme.colors.primary}1A`};
  }
`;

const DeleteButton = styled(Button)`
  padding: 4px 8px;
  font-size: 0.8rem;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => `${theme.colors.primary}1A`};
  }
`;

const PermissionsContainer = styled(Card)`
  flex-grow: 1;
`;

const PermissionsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  
  th, td {
    padding: ${({ theme }) => theme.spacing.sm};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
  
  th {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }
  
  td {
    text-align: center;
  }

  tbody tr:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;



const ENTITIES = [
  // Essas são as permissões genéricas
  { key: 'calendars', name: 'Todos os Calendários (Admin)' },
  { key: 'users', name: 'Usuários' },
  { key: 'profiles', name: 'Perfis' },
];

const ProfileManagement: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const canCreateProfiles = usePermission('create', 'profiles', user.user.profile as Profile);
  const canUpdateProfiles = usePermission('update', 'profiles', user.user.profile as Profile);
  const canDeleteProfiles = usePermission('delete', 'profiles', user.user.profile as Profile);
  const canUpdatePermissions = usePermission('update', 'profiles', user.user.profile as Profile);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Partial<Profile> | null>(null);

  // NOVO: Estado para armazenar todos os calendários do sistema
  const [allCalendars, setAllCalendars] = useState<Calendar[]>([]);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/user_profile/', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProfiles(response.data);
      // Mantém o perfil selecionado se ele ainda existir na lista
      if (selectedProfile) {
        const updatedSelected = response.data.find((p: Profile) => p.id === selectedProfile.id);
        setSelectedProfile(updatedSelected || (response.data.length > 0 ? response.data[0] : null));
      } else if (response.data.length > 0) {
        setSelectedProfile(response.data[0]);
      }
    } catch (error) {
      console.error("Erro ao buscar perfis:", error);
      alert("Não foi possível carregar os perfis.");
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedProfile]);

  const fetchAllCalendars = useCallback(async () => {
    if (!user.token) return;
    try {
      const response = await api.get('/calendar', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAllCalendars(response.data);
    } catch (error) {
      console.error("Erro ao buscar calendários:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchProfiles();
    fetchAllCalendars();
  }, []); // Executa apenas uma vez ao montar

  // NOVO: Função para manipular a mudança de permissões (genéricas e específicas)
  const handlePermissionChange = (entityName: string, permissionType: keyof Omit<Permission, 'id' | 'entity_name'>, value: boolean) => {
    if (!selectedProfile) return;

    const newPermissions = [...selectedProfile.permissions];
    const permIndex = newPermissions.findIndex(p => p.entity_name === entityName);

    if (permIndex > -1) {
      // Atualiza permissão existente
      newPermissions[permIndex] = { ...newPermissions[permIndex], [permissionType]: value };
    } else {
      // Cria uma nova permissão
      newPermissions.push({
        id: ``, // ID temporário
        entity_name: entityName,
        can_view: false,
        can_create: false,
        can_update: false,
        can_delete: false,
        profile_id: selectedProfile.id,
        [permissionType]: value,
      });
    }

    setSelectedProfile({ ...selectedProfile, permissions: newPermissions });
  };

  // NOVO: Função para salvar TODAS as permissões do perfil selecionado
  const handleSavePermissions = async () => {
    if (!selectedProfile) return;

    setIsSaving(true);
    let payload = {
      id: selectedProfile.id,
      name: selectedProfile.name,
      permissions: selectedProfile.permissions // Envia sem o ID temporário
    };

    try {
        if(payload.id){
          await api.put(`/user_profile/${payload.id}`, { id: payload.id, name: payload.name }, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        }else{
          const res = await api.post(`/user_profile/`, { name: payload.name }, {
            headers: { Authorization: `Bearer ${user.token}` }
          });

          payload = { name: payload.name, id: res.data.id, permissions: payload.permissions.map(p => { return { ...p, profile_id: res.data.id } }) }
        }
        for (const permission of payload.permissions) {
          if (permission.id){
            await api.put(`/permissions/${permission.id}`, { ...permission,  }, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
          } else {
            await api.post(`/permissions/`, { ...permission }, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
          }
        }
    } catch (error) {
        alert(`Falha ao salvar permissões: ${error}.`);
    } finally {
        setIsSaving(false);
        fetchProfiles();
        fetchAllCalendars();
    }
  };

  const renderPermissionsForEntity = (entity: {key: string, name: string}) => {
    const p = selectedProfile?.permissions.find(perm => perm.entity_name === entity.key);
    return (
        <tr key={entity.key}>
            <td>{entity.name}</td>
            <td><input type="checkbox" checked={!!p?.can_view} onChange={e => handlePermissionChange(entity.key, 'can_view', e.target.checked)} /></td>
            <td><input type="checkbox" checked={!!p?.can_create} onChange={e => handlePermissionChange(entity.key, 'can_create', e.target.checked)}/></td>
            <td><input type="checkbox" checked={!!p?.can_update} onChange={e => handlePermissionChange(entity.key, 'can_update', e.target.checked)}/></td>
            <td><input type="checkbox" checked={!!p?.can_delete} onChange={e => handlePermissionChange(entity.key, 'can_delete', e.target.checked)}/></td>
        </tr>
    )
  }

  const handleDeleteProfile = async (profile: Profile) => {
    setIsLoading(true);
    try{
        if (profile && profile.id){
          await api.delete(`/user_profile/${profile.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        }
    }catch(err){
      console.log(err);
    } finally {
      setIsLoading(false);
      fetchProfiles();
      fetchAllCalendars();
    }
  }

  const handleOpenCreateModal = () => {
    setProfileToEdit(null); // Limpa para garantir que é uma criação
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (profile: Profile) => {
    setProfileToEdit(profile);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProfileToEdit(null);
    fetchProfiles(); // Re-busca os perfis após fechar o modal
  };

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
  };

  return (
    <>
      <ProfileLayout>
        <ProfileListContainer>
          <h3>Perfis</h3>
          {isLoading && profiles.length === 0 ? <ActivityIndicator /> : (
            profiles.map(profile => (
              <ProfileListItem
                key={profile.id}
                $isActive={selectedProfile?.id === profile.id}
                onClick={() => handleSelectProfile(profile)}
              >
                <span>{profile.name}</span>
                <div>
                  {canUpdateProfiles && (
                    <EditButton small outline onClick={(e) => { e.stopPropagation(); handleOpenEditModal(profile);}}>
                      <FaEdit />
                    </EditButton>
                  )}
                  {canDeleteProfiles && (
                    <DeleteButton small outline danger onClick={(e) => { e.stopPropagation(); handleDeleteProfile(profile) }}>
                      { isLoading && selectedProfile && selectedProfile.id === profile.id ? (
                        <ActivityIndicator style={{ width: 20, height: 20 }}/>
                      ) : (
                        <FaTrash />
                      )}
                    </DeleteButton>
                  )}
                </div>
              </ProfileListItem>
            ))
          )}
          {canCreateProfiles && (
            <Button outline onClick={handleOpenCreateModal} style={{ width: '100%', marginTop: '1rem' }}>
              <FaPlus style={{ marginRight: '8px' }}/> Novo Perfil
            </Button>
          )}
        </ProfileListContainer>
        
        <PermissionsContainer>
          {isLoading && !selectedProfile ? <ActivityIndicator/> : (
            <>
              <h2>Permissões do Perfil: {selectedProfile?.name}</h2>
              {selectedProfile ? (
                <>
                {/* Tabela de Permissões Genéricas */}
                <h3>Permissões Gerais</h3>
                <PermissionsTable>
                    <thead>
                        <tr>
                            <th>Entidade</th>
                            <th>Ver</th>
                            <th>Criar</th>
                            <th>Editar</th>
                            <th>Excluir</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ENTITIES.map(renderPermissionsForEntity)}
                    </tbody>
                </PermissionsTable>

                {/* Tabela de Permissões Específicas de Calendário */}
                <h3 style={{marginTop: '2rem'}}>Permissões por Calendário</h3>
                <PermissionsTable>
                    <thead>
                        <tr>
                            <th>Calendário Específico</th>
                            <th>Pode Ver</th>
                            <th>Pode Criar Eventos</th>
                            <th>Pode Editar Eventos</th>
                            <th>Pode Excluir Eventos</th>
                        </tr>
                    </thead>
                    <tbody>
                    {allCalendars.map(cal => {
                        // Usamos a convenção `calendar_{id}`
                        const entityKey = `calendar_${cal.id}`;
                        const p = selectedProfile.permissions.find(perm => perm.entity_name === entityKey);
                        return (
                            <tr key={entityKey}>
                                <td>{cal.name}</td>
                                <td><input type="checkbox" checked={!!p?.can_view} onChange={e => handlePermissionChange(entityKey, 'can_view', e.target.checked)} /></td>
                                <td><input type="checkbox" checked={!!p?.can_create} onChange={e => handlePermissionChange(entityKey, 'can_create', e.target.checked)} /></td>
                                <td><input type="checkbox" checked={!!p?.can_update} onChange={e => handlePermissionChange(entityKey, 'can_update', e.target.checked)} /></td>
                                <td><input type="checkbox" checked={!!p?.can_delete} onChange={e => handlePermissionChange(entityKey, 'can_delete', e.target.checked)} /></td>
                            </tr>
                        )
                    })}
                    </tbody>
                </PermissionsTable>

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '2rem'}}>
                    {canUpdatePermissions && (
                      <Button primary onClick={handleSavePermissions} disabled={isSaving}>
                          <FaSave /> {isSaving ? 'Salvando...' : 'Salvar Permissões'}
                      </Button>
                    )}
                </div>
                </>
              ) : <p>Selecione um perfil para gerenciar suas permissões.</p>}
            </>
          )}
        </PermissionsContainer>
      </ProfileLayout>
      
      {/* RENDERIZA O MODAL */}
      <ProfileModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        profile={profileToEdit}
      />
    </>
  );
};

export default ProfileManagement;
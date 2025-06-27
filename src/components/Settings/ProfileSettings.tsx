// src/components/Settings/ProfileManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Card, Button } from '../Common';
import type { Profile } from '../../types';
import api from '../../services/axios';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import ActivityIndicator from '../ActivityIndicator';
import { FaPlus, FaEdit } from 'react-icons/fa';
import ProfileModal from './ProfileModal'; // IMPORTA O NOVO MODAL

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


// --- LÓGICA DO COMPONENTE ---
const ENTITIES = [
  { key: 'tasks', name: 'Tarefas' },
  { key: 'calendars', name: 'Calendários' },
  { key: 'users', name: 'Usuários' },
  { key: 'profiles', name: 'Perfis' },
];

const ProfileManagement: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  
  // NOVO: Estado para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Partial<Profile> | null>(null);


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
  }, [user.token, selectedProfile]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]); // Executa apenas uma vez ao montar


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

  // As permissões agora são apenas para visualização
  const renderPermissions = (profile: Profile | null) => {
    if (!profile) return <p>Selecione um perfil para ver suas permissões.</p>;

    const permissionsMap = new Map(profile.permissions.map(p => [p.entity_name, p]));
    
    return (
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
          {ENTITIES.map(entity => {
            const p = permissionsMap.get(entity.key);
            return (
              <tr key={entity.key}>
                <td>{entity.name}</td>
                <td><input type="checkbox" checked={!!p?.can_view} readOnly /></td>
                <td><input type="checkbox" checked={!!p?.can_create} readOnly /></td>
                <td><input type="checkbox" checked={!!p?.can_update} readOnly /></td>
                <td><input type="checkbox" checked={!!p?.can_delete} readOnly /></td>
              </tr>
            )
          })}
        </tbody>
      </PermissionsTable>
    );
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
                <EditButton small outline onClick={(e) => { e.stopPropagation(); handleOpenEditModal(profile);}}>
                  <FaEdit />
                </EditButton>
              </ProfileListItem>
            ))
          )}
          <Button outline onClick={handleOpenCreateModal} style={{ width: '100%', marginTop: '1rem' }}>
            <FaPlus style={{ marginRight: '8px' }}/> Novo Perfil
          </Button>
        </ProfileListContainer>
        
        <PermissionsContainer>
          {isLoading && !selectedProfile ? <ActivityIndicator/> : (
            <>
              <h2>Permissões do Perfil</h2>
              {renderPermissions(selectedProfile)}
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
// src/components/Settings/UserManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Card, Button } from '../Common';
import type { Profile, User } from '../../types';
import api from '../../services/axios';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import ActivityIndicator from '../ActivityIndicator';
import UserModal from './UserModal'; // To be created
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { usePermission } from '../../hooks/usePermission';

// --- ESTILOS ---
const UserManagementContainer = styled(Card)`
  max-width: 900px;
  margin: auto;
`;

const UserList = styled.div`
    margin-top: ${({ theme }) => theme.spacing.lg};
`;

const UserItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => theme.spacing.sm};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    &:last-child {
        border-bottom: none;
    }
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
`;

const Avatar = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

// --- LÓGICA DO COMPONENTE ---
const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const authUser = useSelector((state: { authreducer: AuthState }) => state.authreducer);
    const canCreateUsers = usePermission('create', 'users', authUser.user.profile as Profile);
    const canUpdateUsers = usePermission('update', 'users', authUser.user.profile as Profile);
    const canDeleteUsers = usePermission('delete', 'users', authUser.user.profile as Profile);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/user', {
                headers: { Authorization: `Bearer ${authUser.token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            alert("Não foi possível carregar os usuários.");
        } finally {
            setIsLoading(false);
        }
    }, [authUser]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenCreateModal = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setUserToEdit(null);
        fetchUsers();
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                await api.delete(`/user/${userId}`, {
                    headers: { Authorization: `Bearer ${authUser.token}` }
                });
                alert('Usuário excluído com sucesso!');
                fetchUsers();
            } catch (error) {
                console.error("Erro ao excluir usuário:", error);
                alert("Não foi possível excluir o usuário.");
            }
        }
    };

    return (
        <UserManagementContainer>
            <Header>
                <h2>Gerenciamento de Usuários</h2>
                {canCreateUsers && (
                  <Button primary onClick={handleOpenCreateModal}>
                      <FaPlus /> Novo Usuário
                  </Button>
                )}
            </Header>

            {isLoading ? (
                <ActivityIndicator />
            ) : (
                <UserList>
                    {users.map(user => (
                        <UserItem key={user.id}>
                            <UserInfo>
                                <Avatar src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                                <div>
                                    <strong>{user.name}</strong>
                                    <p>{user.email}</p>
                                </div>
                            </UserInfo>
                            <ActionButtons>
                                {canUpdateUsers && (
                                  <Button outline small onClick={() => handleOpenEditModal(user)}>
                                      <FaEdit /> Editar
                                  </Button>
                                )}
                                {canDeleteUsers && (
                                  <Button danger small onClick={() => handleDeleteUser(user.id)}>
                                      <FaTrash /> Excluir
                                  </Button>
                                )}
                            </ActionButtons>
                        </UserItem>
                    ))}
                </UserList>
            )}

            {isModalOpen && (
                <UserModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    user={userToEdit}
                />
            )}
        </UserManagementContainer>
    );
};

export default UserManagement;
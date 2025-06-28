// src/components/Settings/UserModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Card, Button } from '../Common';
import type { User, Profile } from '../../types';
import api from '../../services/axios';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import ActivityIndicator from '../ActivityIndicator';

// --- ESTILOS ---
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const ModalContent = styled(Card)<{ $isOpen: boolean }>`
  width: 90%;
  max-width: 500px;
  transform: ${({ $isOpen }) => ($isOpen ? 'translateY(0)' : 'translateY(20px)')};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: transform 0.3s ease, opacity 0.3s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  h2 { margin: 0; }
`;

const FormGroup = styled.div` margin-bottom: 1rem; `;
const Label = styled.label` display: block; margin-bottom: .5rem; font-weight: 500;`;
const Input = styled.input`
  width: 100%;
  padding: .75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
`;
const Select = styled.select`
  width: 100%;
  padding: .75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

// --- LÓGICA DO COMPONENTE ---
interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user }) => {
    const [currentUser, setCurrentUser] = useState<Partial<User>>({});
    const [password, setPassword] = useState('');
    const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingProfiles, setIsFetchingProfiles] = useState(false);
    const authUser = useSelector((state: { authreducer: AuthState }) => state.authreducer);
    const isEditing = !!user?.id;

    const fetchProfiles = useCallback(async () => {
        setIsFetchingProfiles(true);
        try {
            const response = await api.get('/user_profile/', {
                headers: { Authorization: `Bearer ${authUser.token}` }
            });
            setAvailableProfiles(response.data);
        } catch (error) {
            console.error("Erro ao buscar perfis:", error);
            alert("Não foi possível carregar os perfis.");
        } finally {
            setIsFetchingProfiles(false);
        }
    }, [authUser.token]);

    useEffect(() => {
        if (isOpen) {
            fetchProfiles();
            if (user) {
                setCurrentUser(user);
            } else {
                setCurrentUser({
                    name: '',
                    email: '',
                    avatarUrl: '',
                    profile_id: '',
                });
            }
        }
    }, [user, isOpen, fetchProfiles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!currentUser.name || !currentUser.email || !currentUser.profile_id) {
            alert("Nome, email e perfil são obrigatórios.");
            return;
        }
        if (!isEditing && !password) {
            alert("A senha é obrigatória para criar um novo usuário.");
            return;
        }

        setIsLoading(true);

        const payload: Partial<User> & { password?: string } = {
            ...currentUser,
        };

        if (password) {
            payload.password = password;
        }
        // Assegura que o profile_id seja um número, se a API esperar um
        payload.profile_id = String(currentUser.profile_id);


        const url = isEditing ? `/user/${user?.id}` : '/user';
        const method = isEditing ? 'put' : 'post';

        try {
            await api[method](url, payload, {
                headers: { Authorization: `Bearer ${authUser.token}` }
            });
            alert(`Usuário ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
            onClose();
        } catch (error) {
            console.error(`Erro ao salvar usuário:`, error);
            alert(`Não foi possível salvar o usuário.`);
        } finally {
            setIsLoading(false);
        }
    };

    console.log(currentUser)

    if (!isOpen) return null;

    return (
        <ModalOverlay $isOpen={isOpen} onClick={onClose}>
            <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <h2>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                    <button onClick={onClose}>&times;</button>
                </ModalHeader>

                <FormGroup>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" name="name" type="text" value={currentUser.name || ''} onChange={handleChange} />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={currentUser.email || ''} onChange={handleChange} />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isEditing ? 'Deixe em branco para não alterar' : ''} />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="avatarUrl">URL do Avatar</Label>
                    <Input id="avatarUrl" name="avatarUrl" type="text" value={currentUser.avatarUrl || ''} onChange={handleChange} />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="profile_id">Perfil</Label>
                    {isFetchingProfiles ? <ActivityIndicator /> : (
                        <Select id="profile_id" name="profile_id" value={currentUser.profile_id || ''} onChange={handleChange}>
                            <option value="" disabled>Selecione um perfil</option>
                            {availableProfiles.map(profile => (
                                <option key={profile.id} value={profile.id}>
                                    {profile.name}
                                </option>
                            ))}
                        </Select>
                    )}
                </FormGroup>


                <ModalFooter>
                    {isLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <>
                            <Button outline onClick={onClose}>Cancelar</Button>
                            <Button primary onClick={handleSave}>
                                {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
                            </Button>
                        </>
                    )}
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

export default UserModal;
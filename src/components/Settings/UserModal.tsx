// src/components/Settings/UserModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Card, Button } from '../Common';
import type { User, Profile } from '../../types';
import api from '../../services/axios';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import ActivityIndicator from '../ActivityIndicator';

// --- NOVO: Estilo para exibir as mensagens de erro ---
const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
  margin-top: 4px;
`;

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

const FormGroup = styled.div` 
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem; 
`;
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
    // --- NOVO: Estado para os erros de validação ---
    const [errors, setErrors] = useState<Record<string, string>>({});

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
                    phone_number: '',
                });
            }
            // Limpa os erros ao abrir
            setErrors({});
            setPassword('');
        }
    }, [user, isOpen, fetchProfiles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Limpa o erro do campo que está sendo alterado
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
        setCurrentUser(prev => ({ ...prev, [name]: value }));
    };

    // --- NOVA FUNÇÃO DE VALIDAÇÃO ---
    const validateFields = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!currentUser.name?.trim()) newErrors.name = "O nome é obrigatório.";
        if (!currentUser.email?.trim()) newErrors.email = "O e-mail é obrigatório.";
        if (!currentUser.phone_number?.trim()) newErrors.phone_number = "O telefone é obrigatório.";
        if (!currentUser.profile_id) newErrors.profile_id = "O perfil é obrigatório.";
        
        if (!isEditing && !password.trim()) {
            newErrors.password = "A senha é obrigatória para novos usuários.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSave = async () => {
        // Chama a validação antes de prosseguir
        if (!validateFields()) {
            return;
        }

        setIsLoading(true);
        const payload: Partial<User> & { password?: string } = { ...currentUser };

        if (password) {
            payload.password = password;
        }
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

    if (!isOpen) return null;

    return (
        <ModalOverlay $isOpen={isOpen}>
            <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <h2>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                    <button onClick={onClose}>&times;</button>
                </ModalHeader>

                <FormGroup>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" name="name" type="text" value={currentUser.name || ''} onChange={handleChange} />
                    {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={currentUser.email || ''} onChange={handleChange} />
                    {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" name="password" type="password" value={password} onChange={(e) => {
                        if(errors.password) setErrors(prev => ({...prev, password: ''}));
                        setPassword(e.target.value)
                    }} placeholder={isEditing ? 'Deixe em branco para não alterar' : ''} />
                    {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="phone_number">Telefone</Label>
                    <Input id="phone_number" name="phone_number" type="tel" value={currentUser.phone_number || ''} onChange={handleChange} placeholder={'Ex: 11900000000'} />
                    {errors.phone_number && <ErrorMessage>{errors.phone_number}</ErrorMessage>}
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
                    {errors.profile_id && <ErrorMessage>{errors.profile_id}</ErrorMessage>}
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
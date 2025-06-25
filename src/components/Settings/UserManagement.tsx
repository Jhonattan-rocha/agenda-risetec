// src/components/Settings/UserManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Card, Button } from '../Common';
import { theme } from '../../styles/theme';
import type { Profile } from '../../types';
import api from '../../services/axios';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import ActivityIndicator from '../ActivityIndicator';

// --- ESTILOS ---
const UserFormContainer = styled(Card)`
  max-width: 700px;
  margin: auto;
`;
const FormGroup = styled.div` margin-bottom: 1rem; `;
const Label = styled.label` display: block; margin-bottom: .5rem; font-weight: 500;`;
const Input = styled.input`
  width: 100%;
  padding: .75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius};
  font-size: 1rem;
`;
const ProfileSelectorContainer = styled.div`
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius};
  padding: ${theme.spacing.sm};
`;
const ProfileCheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xs} 0;
`;
const ActionFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${theme.spacing.xl};
`;


// --- LÓGICA DO COMPONENTE ---
const UserManagement: React.FC = () => {
  // Simplesmente um formulário para criar, não vamos listar usuários aqui para simplificar
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([]);
  const [selectedProfileIds, setSelectedProfileIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      // Endpoint que criamos anteriormente
      const response = await api.get('/user_profile/', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAvailableProfiles(response.data);
    } catch (error) {
      console.error("Erro ao buscar perfis:", error);
      alert("Não foi possível carregar os perfis para seleção.");
    } finally {
      setIsLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleProfileSelection = (profileId: string) => {
    const newSelection = new Set(selectedProfileIds);
    if (newSelection.has(profileId)) {
      newSelection.delete(profileId);
    } else {
      newSelection.add(profileId);
    }
    setSelectedProfileIds(newSelection);
  };

  const handleCreateUser = async () => {
    if (!name || !email || !password) {
      alert("Nome, email e senha são obrigatórios.");
      return;
    }
    setIsLoading(true);
    
    // O endpoint de criação de usuário na sua API
    // deve ser adaptado para receber uma lista de profile_ids
    const newUser = {
      name,
      email,
      password,
      profile_ids: Array.from(selectedProfileIds), // Envia os IDs dos perfis
    };

    try {
      // Você precisará criar este endpoint na sua API
      await api.post('/users/', newUser, {
         headers: { Authorization: `Bearer ${user.token}` }
      });
      alert(`Usuário "${name}" criado com sucesso!`);
      // Limpar formulário
      setName('');
      setEmail('');
      setPassword('');
      setSelectedProfileIds(new Set());
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      alert("Não foi possível criar o usuário.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserFormContainer>
      <h2>Criar Novo Usuário</h2>
      <p>Crie um novo usuário e atribua os perfis de permissão necessários.</p>
      
      <FormGroup>
        <Label>Nome Completo</Label>
        <Input type="text" value={name} onChange={e => setName(e.target.value)} />
      </FormGroup>

      <FormGroup>
        <Label>Email</Label>
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </FormGroup>
      
      <FormGroup>
        <Label>Senha</Label>
        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </FormGroup>

      <FormGroup>
        <Label>Perfis de Permissão</Label>
        {isLoading && !availableProfiles.length ? (
            <ActivityIndicator />
        ) : (
            <ProfileSelectorContainer>
                {availableProfiles.map(profile => (
                    <ProfileCheckboxItem key={profile.id}>
                    <input
                        type="checkbox"
                        id={`profile-${profile.id}`}
                        checked={selectedProfileIds.has(profile.id)}
                        onChange={() => handleProfileSelection(profile.id)}
                    />
                    <label htmlFor={`profile-${profile.id}`}>{profile.name}</label>
                    </ProfileCheckboxItem>
                ))}
            </ProfileSelectorContainer>
        )}
      </FormGroup>

      <ActionFooter>
        <Button primary onClick={handleCreateUser} disabled={isLoading}>
          {isLoading ? 'Criando...' : 'Criar Usuário'}
        </Button>
      </ActionFooter>
    </UserFormContainer>
  );
};

export default UserManagement;
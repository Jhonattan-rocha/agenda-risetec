// src/components/Settings/ProfileSettings.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, Button } from '../Common';
import { theme } from '../../styles/theme';

const SettingsCard = styled(Card)`
  h2 { margin-top: 0; }
  p { margin-bottom: 1.5rem; }
`;
const FormGroup = styled.div` margin-bottom: 1rem; `;
const Label = styled.label` display: block; margin-bottom: .5rem; font-weight: 500;`;
const Input = styled.input` 
  width: 100%; 
  padding: .75rem; 
  border: 1px solid ${theme.colors.border};
  background-color: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  border-radius: ${theme.borderRadius};
  font-size: 1rem;
`;

const ProfileSettings: React.FC = () => {
  const [profile, setProfile] = useState({ name: 'Usuário Exemplo', email: 'usuario@exemplo.com' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert("Perfil salvo (simulação).");
  };

  return (
    <SettingsCard>
      <h2>Perfil do Usuário</h2>
      <p>Gerencie suas informações pessoais.</p>
      <FormGroup>
        <Label>Nome</Label>
        <Input type="text" name="name" value={profile.name} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label>Email</Label>
        <Input type="email" name="email" value={profile.email} onChange={handleChange} />
      </FormGroup>
       <FormGroup>
        <Label>Alterar Senha</Label>
        <Input type="password" name="password" placeholder="Nova senha" />
      </FormGroup>
      <Button primary onClick={handleSave}>Salvar Alterações</Button>
    </SettingsCard>
  );
};

export default ProfileSettings;
// src/components/Settings/SmtpSettings.tsx
import React, { useState } from 'react';
import { Card, Button } from '../Common';
import styled from 'styled-components';

const SettingsCard = styled(Card)`
  h2 { margin-top: 0; }
`;
const FormGroup = styled.div` margin-bottom: 1rem; `;
const Label = styled.label` display: block; margin-bottom: .5rem; `;
const Input = styled.input` width: 100%; padding: .5rem; `;

const SmtpSettings: React.FC = () => {
  const [smtp, setSmtp] = useState({ host: '', port: '', user: '', pass: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSmtp({ ...smtp, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Salvando configurações SMTP:", smtp);
    alert("Configurações SMTP salvas (simulação). Veja o console.");
  };

  return (
    <SettingsCard>
      <h2>Configuração de E-mail (SMTP)</h2>
      <p>Configure um servidor SMTP para enviar notificações de eventos por e-mail.</p>
      <FormGroup>
        <Label>Host</Label>
        <Input type="text" name="host" value={smtp.host} onChange={handleChange} placeholder="smtp.example.com" />
      </FormGroup>
      <FormGroup>
        <Label>Porta</Label>
        <Input type="text" name="port" value={smtp.port} onChange={handleChange} placeholder="587" />
      </FormGroup>
      <FormGroup>
        <Label>Usuário</Label>
        <Input type="text" name="user" value={smtp.user} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label>Senha</Label>
        <Input type="password" name="pass" value={smtp.pass} onChange={handleChange} />
      </FormGroup>
      <Button primary onClick={handleSave}>Salvar</Button>
    </SettingsCard>
  );
};

export default SmtpSettings;
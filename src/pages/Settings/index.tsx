// src/pages/Settings/index.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';
import SmtpSettings from '../../components/Settings/SmtpSettings';
import WhatsAppSettings from '../../components/Settings/WhatsAppSettings';
import ProfileSettings from '../../components/Settings/ProfileSettings';
import AppearanceSettings from '../../components/Settings/AppearanceSettings';
import { FaUser, FaPalette, FaShareAlt } from 'react-icons/fa';

const SettingsLayout = styled.div`
  display: flex;
  max-width: 1200px;
  margin: 40px auto;
  padding: ${theme.spacing.lg};
  gap: ${theme.spacing.xl};
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius};
  box-shadow: ${theme.boxShadow};

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const SettingsNav = styled.nav`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 220px;
  border-right: 1px solid ${theme.colors.border};
  padding-right: ${theme.spacing.lg};

  @media (max-width: 900px) {
    flex-direction: row;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid ${theme.colors.border};
    padding-right: 0;
    padding-bottom: ${theme.spacing.md};
    overflow-x: auto;
  }
`;

const NavItem = styled.a<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius};
  cursor: pointer;
  color: ${props => props.$isActive ? theme.colors.primary : theme.colors.textSecondary};
  background-color: ${props => props.$isActive ? `${theme.colors.primary}1A` : 'transparent'};
  font-weight: 500;
  transition: ${theme.transition};

  &:hover {
    background-color: ${`${theme.colors.primary}1A`};
    color: ${theme.colors.primary};
  }

  @media (max-width: 900px) {
    flex-shrink: 0;
    justify-content: center;
  }
`;

const SettingsContent = styled.main`
  flex-grow: 1;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  margin: 0;
`;

const BackLink = styled(Link)`
  font-size: 1rem;
  color: ${theme.colors.primary};
`;

type Tab = 'profile' | 'appearance' | 'integrations' | 'notifications';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'integrations':
        return (
          <>
            <SmtpSettings />
            <WhatsAppSettings />
          </>
        );
      // Adicione a seção de Notificações quando o componente for criado
      // case 'notifications':
      //   return <NotificationSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <>
      <Header style={{ maxWidth: 1200, margin: '40px auto 20px', padding: `0 ${theme.spacing.lg}` }}>
        <Title>Configurações</Title>
        <BackLink to="/">Voltar ao Calendário</BackLink>
      </Header>
      <SettingsLayout>
        <SettingsNav>
          <NavItem $isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
            <FaUser /> Perfil
          </NavItem>
          <NavItem $isActive={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')}>
            <FaPalette /> Aparência
          </NavItem>
          <NavItem $isActive={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')}>
            <FaShareAlt /> Integrações
          </NavItem>
          {/* <NavItem $isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
            <FaPaperPlane /> Notificações
          </NavItem> */}
        </SettingsNav>
        <SettingsContent>
          {renderContent()}
        </SettingsContent>
      </SettingsLayout>
    </>
  );
};

export default SettingsPage;
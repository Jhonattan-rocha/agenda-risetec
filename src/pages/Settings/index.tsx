// src/pages/Settings/index.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import ProfileSettings from '../../components/Settings/ProfileSettings';
import AppearanceSettings from '../../components/Settings/AppearanceSettings';
import { FaUser, FaPalette, FaUsersCog } from 'react-icons/fa'; // Ícone atualizado
import UserManagement from '../../components/Settings/UserManagement';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import { usePermission } from '../../hooks/usePermission'; // Importa o hook

// ... (estilos permanecem os mesmos)
const SettingsLayout = styled.div`
  display: flex;
  max-width: 1200px;
  margin: 40px auto;
  padding: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const SettingsNav = styled.nav`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 220px;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding-right: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 900px) {
    flex-direction: row;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding-right: 0;
    padding-bottom: ${({ theme }) => theme.spacing.md};
    overflow-x: auto;
  }
`;

const NavItem = styled.a<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.textSecondary};
  background-color: ${props => props.$isActive ? `${props.theme.colors.primary}1A` : 'transparent'};
  font-weight: 500;
  transition: ${({ theme }) => theme.transition};

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}1A`};
    color: ${({ theme }) => theme.colors.primary};
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
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  margin: 0;
`;

const BackLink = styled(Link)`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

type Tab = 'profiles' | 'users' | 'appearance';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('appearance');
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const navigate = useNavigate();

  // Verificações de permissão
  const canViewProfiles = usePermission('view', 'profiles');
  const canViewUsers = usePermission('view', 'users');

  useEffect(() => {
    // Define a aba padrão com base nas permissões
    if (canViewProfiles) {
      setActiveTab('profiles');
    } else if (canViewUsers) {
      setActiveTab('users');
    } else {
      setActiveTab('appearance');
    }
  }, [canViewProfiles, canViewUsers]);


  const renderContent = () => {
    switch (activeTab) {
      case 'profiles':   return canViewProfiles ? <ProfileSettings /> : null;
      case 'users':        return canViewUsers ? <UserManagement /> : null;
      case 'appearance':   return <AppearanceSettings />;
      default:             return <AppearanceSettings />;
    }
  };

  useEffect(() => {
    if(!user?.isLoggedIn){
      navigate("/login");
    }
  }, [navigate, user]);

  return (
    <>
      <Header style={{ maxWidth: 1200, margin: '40px auto 20px'}}>
        <Title>Configurações</Title>
        <BackLink to="/">Voltar ao Calendário</BackLink>
      </Header>
      <SettingsLayout>
        <SettingsNav>
          {/* Aba de Perfis */}
          {canViewProfiles && (
            <NavItem $isActive={activeTab === 'profiles'} onClick={() => setActiveTab('profiles')}>
              <FaUsersCog /> Perfis
            </NavItem>
          )}

          {/* Aba de Usuários */}
          {canViewUsers && (
            <NavItem $isActive={activeTab === 'users'} onClick={() => setActiveTab('users')}>
              <FaUser /> Usuários
            </NavItem>
          )}
          
          {/* Aba de Aparência (geralmente visível para todos) */}
          <NavItem $isActive={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')}>
            <FaPalette /> Aparência
          </NavItem>

        </SettingsNav>
        <SettingsContent>
          {renderContent()}
        </SettingsContent>
      </SettingsLayout>
    </>
  );
};

export default SettingsPage;
// src/pages/Settings/index.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import ProfileSettings from '../../components/Settings/ProfileSettings';
import AppearanceSettings from '../../components/Settings/AppearanceSettings';
// IMPORTAR O NOVO ÍCONE E O NOVO COMPONENTE
import { FaUser, FaPalette, FaUsersCog, FaWhatsapp } from 'react-icons/fa'; 
import UserManagement from '../../components/Settings/UserManagement';
import WhatsAppSettings from '../../components/Settings/WhatsAppSettings'; // NOVO
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import { usePermission } from '../../hooks/usePermission'; 
import type { Profile } from '../../types';

// ... (Styled Components permanecem os mesmos) ...
const SettingsLayout = styled.div`
  display: flex;
  max-width: 1200px;
  margin: 20px auto;
  padding: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};

  @media (max-width: 900px) {
    flex-direction: column;
    padding: ${({ theme }) => theme.spacing.md};
    margin: 10px;
    gap: ${({ theme }) => theme.spacing.lg};
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
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, and Opera */
    }
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
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    span {
      display: none; // Oculta o texto em telas muito pequenas
    }
  }
  @media (min-width: 601px) and (max-width: 900px) {
    span {
      display: inline; // Mostra o texto em tablets
    }
  }
`;

const SettingsContent = styled.main`
  flex-grow: 1;
  min-width: 0; // Previne que o conteúdo force o layout a expandir
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 40px auto 20px;
  padding: 0 ${({ theme }) => theme.spacing.lg};

  @media (max-width: 900px) {
    margin: 20px auto 10px;
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

const Title = styled.h1`
  margin: 0;
`;

const BackLink = styled(Link)`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;


// ADICIONAR A NOVA OPÇÃO AO TIPO DE ABA
type Tab = 'profiles' | 'users' | 'appearance' | 'whatsapp';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('appearance');
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const navigate = useNavigate();

  const canViewProfiles = usePermission('view', 'profiles', user.user.profile as Profile);
  const canViewUsers = usePermission('view', 'users', user.user.profile as Profile);
  // Crie uma permissão para 'integrations' ou 'whatsapp' se quiser restringir o acesso
  const canViewWhatsapp = usePermission('view', 'integrations', user.user.profile as Profile);

  useEffect(() => {
    // Ajusta a aba inicial com base nas permissões
    if (canViewProfiles) {
      setActiveTab('profiles');
    } else if (canViewUsers) {
      setActiveTab('users');
    } else if (canViewWhatsapp){
      setActiveTab('whatsapp');
    } else {
      setActiveTab('appearance');
    }
  }, [canViewProfiles, canViewUsers, canViewWhatsapp]);


  const renderContent = () => {
    switch (activeTab) {
      case 'profiles':   return canViewProfiles ? <ProfileSettings /> : null;
      case 'users':      return canViewUsers ? <UserManagement /> : null;
      // ADICIONAR O RENDER DO NOVO COMPONENTE
      case 'whatsapp':   return canViewWhatsapp ? <WhatsAppSettings /> : null;
      case 'appearance': return <AppearanceSettings />;
      default:           return <AppearanceSettings />;
    }
  };

  useEffect(() => {
    if(!user?.isLoggedIn){
      navigate("/login");
    }
  }, [navigate, user]);

  return (
    <>
      <Header>
        <Title>Configurações</Title>
        <BackLink to="/">Voltar ao Calendário</BackLink>
      </Header>
      <SettingsLayout>
        <SettingsNav>
          {canViewProfiles && (
            <NavItem $isActive={activeTab === 'profiles'} onClick={() => setActiveTab('profiles')}>
              <FaUsersCog /> <span>Perfis</span>
            </NavItem>
          )}
          {canViewUsers && (
            <NavItem $isActive={activeTab === 'users'} onClick={() => setActiveTab('users')}>
              <FaUser /> <span>Usuários</span>
            </NavItem>
          )}
          {/* ADICIONAR A NOVA ABA DE NAVEGAÇÃO */}
          {canViewWhatsapp && (
            <NavItem $isActive={activeTab === 'whatsapp'} onClick={() => setActiveTab('whatsapp')}>
              <FaWhatsapp /> <span>WhatsApp</span>
            </NavItem>
          )}
          <NavItem $isActive={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')}>
            <FaPalette /> <span>Aparência</span>
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
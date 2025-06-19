// src/App.tsx
import { ThemeProvider } from './contexts/ThemeContext';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import CalendarScreen from './components/Calendar/Calendar';
import styled from 'styled-components';
import store, { persistor } from './store';
import LoginPage from './components/Login';
import SettingsPage from './pages/Settings';
import { FaCog, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useState } from 'react';
import { type AuthState } from './store/modules/types';
import * as authActions from './store/modules/authReducer/actions';
import { theme } from './styles/theme';

const AppHeader = styled.header`
  padding: 10px 20px;
  background-color: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1001;
`;

const UserMenuContainer = styled.div`
  position: relative;
`;

const UserAvatarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${theme.colors.textPrimary};
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: none;
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 120%;
  right: 0;
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius};
  box-shadow: ${theme.boxShadow};
  border: 1px solid ${theme.colors.border};
  width: 200px;
  overflow: hidden;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  z-index: 1002;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: ${theme.colors.textPrimary};
  transition: all 0.2s ease;
  &:hover {
    background-color: ${theme.colors.background};
    color: ${theme.colors.primary};
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: ${theme.colors.textPrimary};
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  &:hover {
    background-color: ${theme.colors.background};
    color: ${theme.colors.error};
  }
`;


const AppContent: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(authActions.Loguot());
    navigate('/login');
  };

  return (
    <>
      <AppHeader>
        <UserMenuContainer>
          <UserAvatarButton onClick={() => setMenuOpen(!menuOpen)}>
            <FaUserCircle size={24} />
            <span>{user.username}</span>
          </UserAvatarButton>
          <DropdownMenu $isOpen={menuOpen}>
            <DropdownItem to="/settings" onClick={() => setMenuOpen(false)}>
              <FaCog /> Configurações
            </DropdownItem>
            <LogoutButton onClick={handleLogout}>
              <FaSignOutAlt /> Sair
            </LogoutButton>
          </DropdownMenu>
        </UserMenuContainer>
      </AppHeader>
      <CalendarScreen />
    </>
  );
}

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <BrowserRouter>
          <ThemeProvider>
            <Routes>
              <Route path='/' element={<AppContent />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='/settings' element={<SettingsPage />} />
            </Routes>
          </ThemeProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
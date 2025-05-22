// src/App.tsx
import { ThemeProvider, useTheme } from './contexts/ThemeContext'; // Importe o nosso ThemeProvider
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CalendarScreen from './components/Calendar/Calendar';
import styled from 'styled-components'; // Importe styled-components aqui para o botão de tema
import store, { persistor } from './store';
import LoginPage from './components/Login';

// Estilo para o botão de alternar tema
const ThemeToggleButton = styled.button`
  position: fixed;
  top: 0px;
  right: 20px;
  border: none;
  border-radius: 50px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 1000;
  color: white;

  &:hover {
    transform: translateY(-2px);
  }
`;

const AppContent: React.FC = () => {
  const { themeName, toggleTheme } = useTheme();

  return (
    <>
      <CalendarScreen />
      <ThemeToggleButton onClick={toggleTheme}>
        {themeName === 'light' ? 'Ativar Tema Escuro' : 'Ativar Tema Claro'}
      </ThemeToggleButton>
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
              <Route path='/' index element={<AppContent />} />
              <Route path='/login' element={<LoginPage />} />
            </Routes>
          </ThemeProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
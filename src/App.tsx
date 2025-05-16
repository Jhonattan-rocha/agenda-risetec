// src/App.tsx
import { ThemeProvider, useTheme } from './contexts/ThemeContext'; // Importe o nosso ThemeProvider
import Calendar from './components/Calendar/Calendar';
import styled from 'styled-components'; // Importe styled-components aqui para o botão de tema

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

function AppContent() {
  const { themeName, toggleTheme } = useTheme();

  return (
    <>
      <Calendar />
      <ThemeToggleButton onClick={toggleTheme}>
        {themeName === 'light' ? 'Ativar Tema Escuro' : 'Ativar Tema Claro'}
      </ThemeToggleButton>
    </>
  );
}

function App() {
  return (
    <ThemeProvider> {/* Use o nosso ThemeProvider aqui */}
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
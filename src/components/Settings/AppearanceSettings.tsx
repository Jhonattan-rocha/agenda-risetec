// src/components/Settings/AppearanceSettings.tsx
import React, { useContext } from 'react';
import styled from 'styled-components';
import { Card } from '../Common';
import ToggleSwitch from '../Common/ToggleSwitch';
import { ThemeContext } from '../../utils/contexts';

const SettingsCard = styled(Card)`
  h2 { margin-top: 0; }
  p { margin-bottom: 1.5rem; }
`;

const ThemeSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: 1.5rem;
`;

const ThemeDisplay = styled.textarea`
    width: 100%;
    min-height: 300px;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: ${({ theme }) => theme.spacing.md};
    font-family: monospace;
    font-size: 0.85rem;
    resize: vertical;
    white-space: pre; // Garante que a formatação do JSON seja mantida
`;

const AppearanceSettings: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDarkMode = theme.colors.background === '#121212';

  return (
    <SettingsCard>
      <h2>Aparência</h2>
      <p>Customize a aparência da aplicação.</p>
      <ThemeSelector>
        <span>Modo Escuro</span>
        <ToggleSwitch isOn={isDarkMode} handleToggle={toggleTheme} />
      </ThemeSelector>
      <ThemeDisplay readOnly value={JSON.stringify(theme, null, 2)} />
    </SettingsCard>
  );
};

export default AppearanceSettings;
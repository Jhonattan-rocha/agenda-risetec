// src/components/Settings/AppearanceSettings.tsx
import React from 'react';
import styled from 'styled-components';
import { Card } from '../Common';
import { useTheme } from '../../contexts/ThemeContext'; 
import { theme } from '../../styles/theme';
import ToggleSwitch from '../Common/ToggleSwitch';

const SettingsCard = styled(Card)`
  h2 { margin-top: 0; }
  p { margin-bottom: 1.5rem; }
`;

const ThemeSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius};
`;

const AppearanceSettings: React.FC = () => {
  const { themeName, toggleTheme } = useTheme();

  return (
    <SettingsCard>
      <h2>Aparência</h2>
      <p>Customize a aparência da aplicação.</p>
      <ThemeSelector>
        <span>Modo Escuro</span>
        <ToggleSwitch
          isOn={themeName === 'dark'}
          handleToggle={toggleTheme}
        />
      </ThemeSelector>
    </SettingsCard>
  );
};

export default AppearanceSettings;
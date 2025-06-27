export interface ThemeType {
  colors: {
    primary: string, // um roxo mais claro para contraste
    primaryLight: string,
    secondary: string, // amarelo
    background: string, // cinza claro para o fundo
    surface: string, // branco para cartões e elementos principais
    textPrimary: string,
    textSecondary: string,
    border: string,
    success: string,
    warning: string,
    error: string,
    accent: string, // green
  },
  fonts: {
    body: string,
    heading: string,
  },
  spacing: {
    xs: string,
    sm: string,
    md: string,
    lg: string,
    xl: string,
  },
  borderRadius: string,
  boxShadow: string,
  transition: string,
}

export const lightTheme: ThemeType = {
  colors: {
    primary: '#21a7ea', // um roxo mais claro para contraste
    primaryLight: '#30aceb',
    secondary: '#FFC107', // amarelo
    background: '#F5F7FA', // cinza claro para o fundo
    surface: '#FFFFFF', // branco para cartões e elementos principais
    textPrimary: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    accent: '#4CAF50', // green
  },
  fonts: {
    body: 'Roboto, sans-serif',
    heading: 'Montserrat, sans-serif',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
};

export const darkTheme: ThemeType = {
  colors: {
    primary: '#21a7ea', // um roxo mais claro para contraste
    primaryLight: '#30aceb',
    secondary: '#FFEB3B', // amarelo para contraste
    background: '#121212', // Fundo bem escuro
    surface: '#1E1E1E', // Superfície de cartões, um pouco mais clara que o fundo
    textPrimary: '#E0E0E0', // Texto claro
    textSecondary: '#A0A0A0', // Texto secundário mais escuro
    border: '#333333', // Bordas sutis
    success: '#66BB6A',
    warning: '#FFC107',
    error: '#EF5350',
    accent: '#81C784',
  },
  fonts: {
    body: 'Roboto, sans-serif',
    heading: 'Montserrat, sans-serif',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: '8px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)', // Sombra mais proeminente no modo escuro
  transition: 'all 0.3s ease-in-out',
};

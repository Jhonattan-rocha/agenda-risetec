// src/styles/GlobalStyles.ts
import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Roboto:wght@300;400;500;700&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${theme.fonts.body};
    line-height: 1.6;
    color: ${theme.colors.textPrimary};
    background-color: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.fonts.heading};
    color: ${theme.colors.textPrimary};
    margin-bottom: ${theme.spacing.md};
  }

  a {
    text-decoration: none;
    color: ${theme.colors.primary};
    &:hover {
      color: ${theme.colors.primaryLight};
    }
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: ${theme.fonts.body};
  }

  ul {
    list-style: none;
  }

  // Scrollbar customization for a cleaner look
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.background};
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 10px;
    &:hover {
      background: ${theme.colors.textSecondary};
    }
  }
`;
// src/components/Common/Card.tsx
import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Card = styled.div`
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius};
  box-shadow: ${theme.boxShadow};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  transition: ${theme.transition};
`;
// src/components/Common/Button.tsx
import styled, { css } from 'styled-components';

interface ButtonProps {
  primary?: boolean;
  outline?: boolean;
  danger?: boolean;
  small?: boolean;
  rounded?: boolean;
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.small ? `${props.theme.spacing.xs} ${props.theme.spacing.sm}` : `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
  border-radius: ${props => props.rounded ? '50px' : props.theme.borderRadius};
  font-size: ${props => props.small ? '0.85rem' : '1rem'};
  font-weight: 500;
  transition: ${({ theme }) => theme.transition};
  text-align: center;
  white-space: nowrap; // Prevent text wrapping

  ${props =>
    props.primary &&
    css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryLight};
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    &:active {
      transform: translateY(0);
      box-shadow: none;
    }
  `}

  ${props =>
    props.outline &&
    css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.primary};
    &:hover {
      background-color: ${({ theme }) => theme.colors.primary}1A; // 10% opacity
      transform: translateY(-2px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    &:active {
      transform: translateY(0);
      box-shadow: none;
    }
  `}

  ${props =>
    props.danger &&
    css`
    background-color: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.surface};
    &:hover {
      background-color: ${({ theme }) => theme.colors.error}E0;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
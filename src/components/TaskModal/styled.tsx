import styled, { css } from "styled-components";
import { theme } from "../../styles/theme";
import { Card } from '../Common';

export const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  ${({ $isOpen }) => $isOpen && css`
    opacity: 1;
    visibility: visible;
  `}
`;

export const ModalContent = styled(Card)<{ $isOpen: boolean }>`
  background-color: ${theme.colors.surface};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;

  ${({ $isOpen }) => $isOpen && css`
    transform: translateY(0);
    opacity: 1;
  `}
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: ${theme.colors.textPrimary};
  }
  button {
    background: none;
    border: none;
    font-size: 1.8rem;
    color: ${theme.colors.textSecondary};
    cursor: pointer;
    &:hover {
      color: ${theme.colors.primary};
    }
  }
`;

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing.sm};
`;

export const Select = styled.select`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius};
  font-size: 1rem;
  background-color: ${theme.colors.background}; /* já escuro */
  color: ${theme.colors.textPrimary};
  transition: border-color 0.2s ease;
  appearance: none; /* remove setinha padrão */
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg fill='%23ccc' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right ${theme.spacing.sm} center;
  background-size: 1rem;
  padding-right: 2rem; /* espaço para a seta */

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  option {
    background-color: ${theme.colors.background}; /* força fundo escuro nas opções */
    color: ${theme.colors.textPrimary};
  }
`;


export const Label = styled.label`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xs};
  font-weight: 500;
`;

export const Input = styled.input`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius};
  font-size: 1rem;
  background-color: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  transition: border-color 0.2s ease;
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

export const TextArea = styled.textarea`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius};
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  background-color: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  label {
    margin-bottom: 0;
  }
`;

export const TimeInputs = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  ${Input} {
    flex: 1;
  }
`;

export const ColorPickerContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

export const ColorSwatch = styled.div<{ $color: string; $isSelected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  cursor: pointer;
  border: 2px solid ${props => props.$isSelected ? theme.colors.primary : 'transparent'};
  box-shadow: ${props => props.$isSelected ? `0 0 0 2px ${theme.colors.primaryLight}` : 'none'};
  transition: all 0.2s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
`;

export const ModalFooter = styled.div<{ $isEditing: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};

  ${props => props.$isEditing && `
    justify-content: space-between;
  `}
`;

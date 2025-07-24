// src/components/RecurrenceModal/styled.tsx
import styled, { css } from 'styled-components';
import { Card, Input as BaseInput, Select as BaseSelect } from '../Common';

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
  z-index: 1050; // Higher z-index to appear over the task modal
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  ${({ $isOpen }) => $isOpen && css`
    opacity: 1;
    visibility: visible;
  `}
`;

export const ModalContent = styled(Card)<{ $isOpen: boolean }>`
  width: 90%;
  max-width: 550px;
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
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
`;

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const FormGroup = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const Select = styled(BaseSelect)`
    max-width: 150px;
`;

export const Input = styled(BaseInput)`
    max-width: 150px;
`;

export const WeekdayButton = styled.button<{ $isSelected: boolean }>`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid ${({ theme }) => theme.colors.border};
    cursor: pointer;
    background-color: ${({ $isSelected, theme }) => $isSelected ? theme.colors.primary : 'transparent'};
    color: ${({ $isSelected, theme }) => $isSelected ? theme.colors.surface : theme.colors.textPrimary};
    transition: all 0.2s ease;

    &:hover {
        border-color: ${({ theme }) => theme.colors.primary};
    }
`;

export const Summary = styled.div`
    background-color: ${({ theme }) => theme.colors.background};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-style: italic;
    grid-column: 2 / -1; // Span across the second column
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
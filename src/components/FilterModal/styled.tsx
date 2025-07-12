// src/components/FilterModal/styled.tsx
import styled from "styled-components";
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
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

export const ModalContent = styled(Card)<{ $isOpen: boolean }>`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius};
  width: 90%;
  max-width: 800px; // Aumentado para melhor visualização
  max-height: 90vh;
  overflow-y: auto;
  transform: ${props => (props.$isOpen ? 'translateY(0)' : 'translateY(20px)')};
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  transition: transform 0.3s ease, opacity 0.3s ease;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  h2 {
    margin: 0;
  }
`;

export const FilterGroupContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto; // Layout em grade para alinhamento
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const OperatorSelector = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px dashed ${({ theme }) => theme.colors.border};

    label {
        font-weight: 500;
    }

    select {
        width: 120px;
    }
`;

export const AddButton = styled.button`
    margin-top: 1rem;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.primary};
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

export const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding-top: 1.5rem;
`;
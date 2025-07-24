// src/components/RecurrenceEditChoiceModal/index.tsx
import React from 'react';
import styled, { css } from 'styled-components';
import { Card, Button } from '../Common';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100; // Z-index alto para sobrepor outros modais
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  ${({ $isOpen }) => $isOpen && css`
    opacity: 1;
    visibility: visible;
  `}
`;

const ModalContent = styled(Card)<{ $isOpen: boolean }>`
  width: 90%;
  max-width: 450px;
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;

  ${({ $isOpen }) => $isOpen && css`
    transform: translateY(0);
    opacity: 1;
  `}
`;

const ModalHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  h3 {
    margin: 0;
    font-size: 1.3rem;
  }
`;

const ModalBody = styled.div`
  p {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ChoiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export type RecurrenceEditChoice = 'this' | 'future' | 'all';

interface RecurrenceEditChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (choice: RecurrenceEditChoice) => void;
  action: 'edit' | 'delete';
}

const RecurrenceEditChoiceModal: React.FC<RecurrenceEditChoiceModalProps> = ({ isOpen, onClose, onConfirm, action }) => {
  if (!isOpen) return null;

  const actionText = action === 'edit' ? 'editar' : 'excluir';

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>{`Deseja ${actionText} o evento recorrente?`}</h3>
        </ModalHeader>
        <ModalBody>
          <p>Esta alteração afetará outras tarefas no seu calendário.</p>
          <ChoiceContainer>
            <Button outline onClick={() => onConfirm('this')}>
              {`Apenas este evento`}
            </Button>
            <Button outline onClick={() => onConfirm('future')}>
              {`Este e os eventos seguintes`}
            </Button>
            <Button outline onClick={() => onConfirm('all')}>
              {`Todos os eventos`}
            </Button>
          </ChoiceContainer>
        </ModalBody>
        <ModalFooter>
            <Button onClick={onClose}>Cancelar</Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default RecurrenceEditChoiceModal;
// src/components/NotificationModal/index.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEnvelope, FaWhatsapp, FaTimes } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../services/axios';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import ActivityIndicator from '../ActivityIndicator';

// --- Interfaces ---
interface Notification {
  id: number;
  channel: 'email' | 'whatsapp';
  content: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Styled Components ---
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  width: 90%;
  max-width: 450px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h3 { margin: 0; }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
`;

const NotificationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex-grow: 1;
`;

const NotificationItem = styled.li<{ $isUnread: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${props => props.$isUnread ? `${props.theme.colors.primary}10` : 'transparent'};

  &:last-child {
    border-bottom: none;
  }
`;

const IconWrapper = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const NotificationText = styled.div`
  flex-grow: 1;
  p {
    margin: 0;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  time {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const EmptyState = styled.div`
    padding: 3rem;
    text-align: center;
    color: ${({ theme }) => theme.colors.textSecondary};
`

// --- Component ---
const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useSelector((state: { authreducer: AuthState }) => state.authreducer);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      api.get<Notification[]>('/notifications/', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          setNotifications(response.data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, token]);

  // O useEffect vai cuidar de adicionar e remover o event listener
  useEffect(() => {
      // 1. Criamos a função que vai lidar com a tecla pressionada
      const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
              // Se a tecla for "Escape", chamamos a função para fechar o modal
              onClose();
          }
      };
      // 2. Adicionamos o listener apenas se o modal estiver aberto
      if (isOpen) {
          document.addEventListener('keydown', handleKeyDown);
      }
      // 3. A "função de limpeza" do useEffect: ESSA PARTE É CRUCIAL!
      // Ela será executada quando o componente for "desmontado" ou antes de o efeito rodar novamente.
      return () => {
          // Removemos o listener para evitar memory leaks (vazamentos de memória)
          // e para que ele não continue "escutando" depois que o modal fechar.
          document.removeEventListener('keydown', handleKeyDown);
      };
      // O efeito depende de `isOpen` e `onClose`. Ele vai re-executar se um deles mudar.
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h3>Notificações</h3>
          <CloseButton onClick={onClose}><FaTimes cursor={"pointer"} /></CloseButton>
        </ModalHeader>
        <NotificationList>
          {isLoading ? (
            <div style={{padding: '2rem'}}><ActivityIndicator /></div>
          ) : notifications.length > 0 ? (
            notifications.map(n => (
              <NotificationItem key={n.id} $isUnread={!n.is_read}>
                <IconWrapper>
                  {n.channel === 'email' ? <FaEnvelope size={20} /> : <FaWhatsapp size={20} />}
                </IconWrapper>
                <NotificationText>
                  <p>{n.content}</p>
                  <time>
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                  </time>
                </NotificationText>
              </NotificationItem>
            ))
          ) : (
            <EmptyState>Você não tem nenhuma notificação.</EmptyState>
          )}
        </NotificationList>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NotificationModal;
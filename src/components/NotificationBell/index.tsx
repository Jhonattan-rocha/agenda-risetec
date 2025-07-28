// src/components/NotificationBell/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaBell } from 'react-icons/fa';
import styled from 'styled-components';
import NotificationModal from '../NotificationModal'; // Importa o modal
import api from '../../services/axios';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';

const BellWrapper = styled.div`
  position: relative;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-left: 10px;
  cursor: pointer;
`;

const Badge = styled.span`
  position: absolute;
  top: -5px;
  right: -8px;
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
  border: 1px solid ${({ theme }) => theme.colors.surface};
`;

const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token, isLoggedIn } = useSelector((state: { authreducer: AuthState }) => state.authreducer);

  const fetchUnread = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const response = await api.get('/notifications/?unread_only=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.length);
    } catch (error) {
      console.error("Falha ao buscar notificações não lidas:", error);
    }
  }, [token, isLoggedIn]);

  useEffect(() => {
    fetchUnread(); // Busca ao carregar o componente
    const intervalId = setInterval(fetchUnread, 30000); // Verifica a cada 30 segundos
    return () => clearInterval(intervalId); // Limpa o intervalo
  }, [fetchUnread]);

  const handleOpenModal = async () => {
    if (!isLoggedIn) return;
    setIsModalOpen(true);
    // Marca como lido no backend e zera o contador no frontend
    if (unreadCount > 0) {
        try {
            await api.post('/notifications/read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(0);
        } catch (error) {
            console.error("Falha ao marcar notificações como lidas:", error);
        }
    }
  };

  if (!isLoggedIn) return null;

  return (
    <>
      <BellWrapper onClick={handleOpenModal}>
        <FaBell size={22} />
        {unreadCount > 0 && <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
      </BellWrapper>
      <NotificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default NotificationBell;
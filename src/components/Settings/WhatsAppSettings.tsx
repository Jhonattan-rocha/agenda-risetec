import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Button } from '../Common';
import { QRCodeCanvas } from 'qrcode.react';
import ActivityIndicator from '../ActivityIndicator';
import { FaCheckCircle, FaTimesCircle, FaQrcode } from 'react-icons/fa';

// NOVO: Importa a instância configurada do Axios
import api from '../../services/axios'; 
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';

// --- ESTILOS (Sem alterações) ---
const SettingsCard = styled(Card)`
  h2 { margin-top: 0; }
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const Status = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin: 1rem 0;
  color: ${({ $status, theme }) => {
    if ($status === 'connected') return theme.colors.success;
    if ($status === 'disconnected' || $status === 'error') return theme.colors.error;
    return theme.colors.textSecondary;
  }};
  background-color: ${({ $status, theme }) => {
    if ($status === 'connected') return `${theme.colors.success}1A`;
    if ($status === 'disconnected' || $status === 'error') return `${theme.colors.error}1A`;
    return theme.colors.background;
  }};
`;

const QrCodeContainer = styled.div`
  width: 280px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem auto;
  padding: 1rem;
  background-color: #fff;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const WhatsAppSettings: React.FC = () => {
  const [status, setStatus] = useState<'disconnected' | 'loading' | 'awaiting_scan' | 'connected' | 'error'>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Carregando status...');
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        // ALTERADO: a chamada de API agora usa `api.get`. 
        // A URL é relativa à `baseURL` configurada no axios.ts.
        // O header de autorização é adicionado automaticamente pelo interceptor.
        const response = await api.get('/whatsapp/status', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        
        // Com Axios, os dados já vêm em `response.data`
        const data = response.data;

        if (!isMounted) return;

        setMessage(data.message || '');
        switch (data.status) {
          case 'READY':
            setStatus('connected');
            setQrCode(null);
            break;
          case 'SCAN_QR':
            setStatus('awaiting_scan');
            setQrCode(data.qrCode);
            break;
          case 'DISCONNECTED':
            setStatus('disconnected');
            setQrCode(null);
            break;
          case 'INITIALIZING':
            setStatus('loading');
            setQrCode(null);
            break;
          default:
            setStatus('error');
            setQrCode(null);
            break;
        }
      } catch (error) {
        // Axios automaticamente rejeita a promise para status de erro (4xx, 5xx)
        console.error("Erro ao buscar status:", error);
        if (isMounted) {
            setStatus('error');
            setMessage('Não foi possível conectar ao servidor da API.');
        }
      }
    };

    fetchStatus();
    const intervalId = setInterval(fetchStatus, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [user]);

  // ALTERADO: usa `api.post`
  const handleConnect = async () => {
    setStatus('loading');
    setMessage('Iniciando conexão...');
    try {
      await api.post('/whatsapp/reconnect', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
    } catch (error) {
      console.error("Erro ao reconectar:", error);
      setStatus('error');
    }
  };

  // ALTERADO: usa `api.post`
  const handleDisconnect = async () => {
    setStatus('loading');
    setMessage('Desconectando...');
    try {
      await api.post('/whatsapp/logout', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      setStatus('error');
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'connected': return <><FaCheckCircle /> Conectado</>;
      case 'disconnected': return <><FaTimesCircle /> Desconectado</>;
      case 'loading': return <>Processando...</>;
      case 'awaiting_scan': return <><FaQrcode /> Aguardando leitura do QR Code...</>;
      case 'error': return <><FaTimesCircle /> Erro de conexão</>;
      default: return <><FaTimesCircle /> Desconhecido</>;
    }
  }

  return (
    <SettingsCard>
      <h2>Integração com WhatsApp</h2>
      <p>Conecte uma conta do WhatsApp para enviar lembretes e notificações.</p>
      
      <Status $status={status}>
        {renderStatus()}
      </Status>
      <p>{message}</p>
      
      <ActionContainer>
        {(status === 'disconnected' || status === 'error') && <Button primary onClick={handleConnect}>Conectar</Button>}
        {status === 'connected' && <Button danger onClick={handleDisconnect}>Desconectar</Button>}
      </ActionContainer>

      {status === 'loading' && <ActivityIndicator />}
      
      {status === 'awaiting_scan' && qrCode && (
        <QrCodeContainer>
          <QRCodeCanvas value={qrCode} size={256} />
        </QrCodeContainer>
      )}

    </SettingsCard>
  );
};

export default WhatsAppSettings;
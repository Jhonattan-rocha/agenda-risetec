// src/components/Settings/WhatsAppSettings.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Card, Button } from '../Common';
import { QRCodeCanvas } from 'qrcode.react';
import ActivityIndicator from '../ActivityIndicator';
import { FaCheckCircle, FaTimesCircle, FaQrcode, FaSpinner } from 'react-icons/fa';
import api from '../../services/axios'; 
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';

// --- ESTILOS ---
const SettingsCard = styled(Card)`
  h2 { margin-top: 0; }
  p { 
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 1.5rem; 
  }
`;

const Status = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin: 1rem 0;
  font-weight: 500;
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
  margin-top: 1rem;
`;

type ConnectionStatus = 'disconnected' | 'loading' | 'awaiting_scan' | 'connected' | 'error' | 'initializing';

const WhatsAppSettings: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Carregando status...');
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);

  const fetchStatus = useCallback(async (isMounted: boolean) => {
    try {
      const response = await api.get('/whatsapp/status', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
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
          setStatus('initializing');
          setQrCode(null);
          break;
        default:
          setStatus('error');
          setQrCode(null);
          break;
      }
    } catch (error) {
      console.error("Erro ao buscar status:", error);
      if (isMounted) {
          setStatus('error');
          setMessage('Não foi possível conectar ao servidor da API de WhatsApp.');
      }
    }
  }, [user.token]);

  useEffect(() => {
    let isMounted = true;
    
    fetchStatus(isMounted); // Busca imediata
    const intervalId = setInterval(() => fetchStatus(isMounted), 5000); // Busca a cada 5 segundos

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchStatus]);

  const handleConnect = async () => {
    setStatus('loading');
    setMessage('Iniciando nova tentativa de conexão...');
    try {
      await api.post('/whatsapp/reconnect', {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // O useEffect cuidará da atualização do status
    } catch (error) {
      console.error("Erro ao reconectar:", error);
      setStatus('error');
      setMessage('Falha ao enviar comando de reconexão.');
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Tem certeza que deseja desconectar a sessão atual do WhatsApp? Será necessário escanear um novo QR Code.')) return;
    setStatus('loading');
    setMessage('Desconectando sessão...');
    try {
      await api.post('/whatsapp/logout', {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      setStatus('error');
      setMessage('Falha ao enviar comando para desconectar.');
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'connected': return <><FaCheckCircle /> Conectado</>;
      case 'disconnected': return <><FaTimesCircle /> Desconectado</>;
      case 'loading': return <><FaSpinner className="spin"/> Processando...</>;
      case 'initializing': return <><FaSpinner className="spin"/> Iniciando serviço...</>;
      case 'awaiting_scan': return <><FaQrcode /> Aguardando leitura do QR Code</>;
      case 'error': return <><FaTimesCircle /> Erro de Conexão</>;
      default: return <><FaTimesCircle /> Desconhecido</>;
    }
  }

  return (
    <SettingsCard>
      <h2>Integração com WhatsApp</h2>
      <p>Conecte uma conta do WhatsApp para enviar lembretes e notificações de eventos aos participantes.</p>
      
      <Status $status={status}>
        {renderStatus()}
      </Status>
      <p><strong>Mensagem do Serviço:</strong> {message}</p>
      
      {(status === 'loading' || status === 'initializing') && <ActivityIndicator />}
      
      {status === 'awaiting_scan' && qrCode && (
        <>
          <p>Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie o código abaixo.</p>
          <QrCodeContainer>
            <QRCodeCanvas value={qrCode} size={256} />
          </QrCodeContainer>
        </>
      )}

      <ActionContainer>
        {(status === 'disconnected' || status === 'error') && <Button primary onClick={handleConnect}>Conectar / Gerar QR Code</Button>}
        {status === 'connected' && <Button danger onClick={handleDisconnect}>Desconectar</Button>}
      </ActionContainer>
    </SettingsCard>
  );
};

export default WhatsAppSettings;
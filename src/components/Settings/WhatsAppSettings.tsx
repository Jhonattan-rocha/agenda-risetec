// src/components/Settings/WhatsAppSettings.tsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Card, Button } from '../Common';
import { theme } from '../../styles/theme';
import { io, Socket } from 'socket.io-client';
import { QRCodeCanvas } from 'qrcode.react';
import ActivityIndicator from '../ActivityIndicator';
import { FaCheckCircle, FaTimesCircle, FaQrcode } from 'react-icons/fa';

const SettingsCard = styled(Card)`
  h2 { margin-top: 0; }
  margin-top: ${theme.spacing.lg};
`;

const Status = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius};
  margin: 1rem 0;
  color: ${({ $status }) => {
    if ($status === 'connected') return theme.colors.success;
    if ($status === 'disconnected' || $status === 'error') return theme.colors.error;
    return theme.colors.textSecondary;
  }};
  background-color: ${({ $status }) => {
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
  border-radius: ${theme.borderRadius};
  box-shadow: ${theme.boxShadow};
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const WhatsAppSettings: React.FC = () => {
  const [status, setStatus] = useState<'disconnected' | 'loading_qr' | 'awaiting_scan' | 'connected' | 'error'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar ao servidor de Socket.IO
    socketRef.current = io("http://localhost:3001"); // URL do seu backend
    const socket = socketRef.current;

    socket.on('connect', () => {
        console.log("Conectado ao servidor de sockets!");
    });

    socket.on('qr_code', (qr: string) => {
      setQrCode(qr);
      setStatus('awaiting_scan');
    });

    socket.on('status', (newStatus: 'connected' | 'disconnected' | 'awaiting_scan') => {
      setStatus(newStatus);
      if(newStatus !== 'awaiting_scan') {
        setQrCode(null);
      }
    });
    
    socket.on('connect_error', () => {
        setStatus('error');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleConnect = () => {
    setStatus('loading_qr');
    socketRef.current?.emit('initialize');
  };

  const handleDisconnect = () => {
    socketRef.current?.emit('disconnect_wa');
    setStatus('disconnected');
    setQrCode(null);
  };

  const renderStatus = () => {
    switch (status) {
        case 'connected': return <><FaCheckCircle /> Conectado</>;
        case 'disconnected': return <><FaTimesCircle /> Desconectado</>;
        case 'loading_qr': return <>Carregando QR Code...</>;
        case 'awaiting_scan': return <><FaQrcode /> Aguardando leitura do QR Code...</>;
        case 'error': return <><FaTimesCircle /> Erro de conexão com o servidor</>;
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
      
      <ActionContainer>
        {status === 'disconnected' && <Button primary onClick={handleConnect}>Conectar</Button>}
        {status === 'connected' && <Button danger onClick={handleDisconnect}>Desconectar</Button>}
      </ActionContainer>

      {status === 'loading_qr' && <ActivityIndicator />}
      
      {status === 'awaiting_scan' && qrCode && (
        <QrCodeContainer>
          <QRCodeCanvas value={qrCode} size={256} />
        </QrCodeContainer>
      )}

      {status === 'error' && <p>Não foi possível conectar ao serviço de WhatsApp. Verifique se o servidor está rodando.</p>}
    </SettingsCard>
  );
};

export default WhatsAppSettings;
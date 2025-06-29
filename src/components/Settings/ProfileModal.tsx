// src/components/Settings/ProfileModal.tsx
import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Card, Button } from '../Common';
import type { Profile } from '../../types';
import api from '../../services/axios';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import ActivityIndicator from '../ActivityIndicator';

// --- ESTILOS ---
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; // Z-index maior para ficar sobre outros elementos
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
  max-width: 500px;
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;

  ${({ $isOpen }) => $isOpen && css`
    transform: translateY(0);
    opacity: 1;
  `}
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  h2 {
    margin: 0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  margin-bottom: .5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: .75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;


// --- LÓGICA DO COMPONENTE ---
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: Partial<Profile> | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const isEditing = !!profile?.id;

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
    } else {
      setName('');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name) {
      alert("O nome do perfil é obrigatório.");
      return;
    }
    setIsLoading(true);

    const payload = { name };
    const url = isEditing ? `/user_profile/${profile?.id}` : '/user_profile/';
    const method = isEditing ? 'put' : 'post';

    try {
      await api[method](url, payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert(`Perfil ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      onClose(); // Fecha o modal e dispara a atualização na tela de perfis
    } catch (error) {
      console.error(`Erro ao salvar perfil:`, error);
      alert(`Não foi possível salvar o perfil.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{isEditing ? 'Editar Perfil' : 'Novo Perfil'}</h2>
          <button onClick={onClose}>&times;</button>
        </ModalHeader>
        
        <FormGroup>
          <Label htmlFor="profileName">Nome do Perfil</Label>
          <Input
            id="profileName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormGroup>

        {/* Adicionar campos de permissão aqui se necessário */}

        <ModalFooter>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <>
              <Button outline onClick={onClose}>Cancelar</Button>
              <Button primary onClick={handleSave}>
                {isEditing ? 'Salvar Alterações' : 'Criar Perfil'}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProfileModal;
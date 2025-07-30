// src/components/Common/UserAvatar.tsx
import React from 'react';
import styled from 'styled-components';
import { getInitials } from '../../utils/dateUtils'; // Ajuste o caminho se necessário
import type { User } from '../../types'; // Supondo que você tenha um tipo User

interface UserAvatarProps {
  user: Partial<User>; // Usando Partial para o caso de o user ser incompleto
  size?: number;
}

// Função simples para gerar uma cor com base no nome
const generateColorFromName = (name: string): string => {
  if (!name) return '#cccccc'; // Cor padrão
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 75%, 60%)`;
  return color;
};

const AvatarImg = styled.img<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  border: 1px solid white;
  object-fit: cover;
`;

const AvatarFallback = styled.div<{ $size: number; $bgColor: string }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  border: 1px solid white;
  background-color: ${({ $bgColor }) => $bgColor};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => $size * 0.5}px;
  font-weight: bold;
  text-transform: uppercase;
`;

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 16 }) => {
  if (user.avatarUrl) {
    return <AvatarImg src={user.avatarUrl} alt={user.name || 'User Avatar'} title={user.name} $size={size} />;
  }

  const initials = getInitials(user.name || '');
  const bgColor = generateColorFromName(user.name || '');

  return (
    <AvatarFallback $size={size} $bgColor={bgColor} title={user.name}>
      {initials}
    </AvatarFallback>
  );
};

export default UserAvatar;
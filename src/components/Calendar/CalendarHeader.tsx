// src/components/Calendar/CalendarHeader.tsx
import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '../Common';
import { FaFilter } from 'react-icons/fa';
import NotificationBell from '../NotificationBell';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onFilterClick: () => void;
  viewMode: 'month' | 'week' | 'day' | 'tasks';
  ViewModeActions: React.ReactNode;
}

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md}; // Padding reduzido
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-top-left-radius: ${({ theme }) => theme.borderRadius};
  border-top-right-radius: ${({ theme }) => theme.borderRadius};

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;


const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem; // Fonte ligeiramente reduzida
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  text-align: center;
  flex-grow: 1; // Permite que o título ocupe o espaço central

  @media (max-width: 768px) {
    order: -1; // Coloca o título no topo em telas pequenas
    width: 100%;
    font-size: 1.1rem;
  }
`;

const NavButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .nav-arrow {
    font-size: 1.2rem;
    width: 38px; // Botões de seta um pouco menores
    height: 38px;
    padding: 0;
    border-radius: 50%;
  }
`;

const TodayButton = styled(Button)`
  font-size: 0.9rem;
  font-weight: 500;
  padding: 6px 12px; // Padding ajustado
`;

// Botão de filtro agora é um ícone circular para consistência
const FilterButton = styled(Button)`
    width: 44px;
    height: 44px;
    border-radius: 50%;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textSecondary};
    border: 1px solid ${({ theme }) => theme.colors.border};
    box-shadow: ${({ theme }) => theme.boxShadow};
    transition: all 0.2s ease-in-out;

    &:hover {
      transform: translateY(-2px);
      background-color: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.primary};
    }
`;


const getHeaderTitle = (date: Date, viewMode: CalendarHeaderProps['viewMode']): string => {
  switch (viewMode) {
    case 'month':
      return format(date, 'MMMM yyyy', { locale: ptBR });
    case 'week': {
            const start = format(date, 'dd MMM', { locale: ptBR });
            const end = format(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6), 'dd MMM', { locale: ptBR });
            return `${start} - ${end}`;
        }
    case 'day':
      return format(date, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
    case 'tasks':
      return 'Todas as Tarefas';
    default:
      return '';
  }
};


const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, onPrev, onNext, onToday, viewMode, onFilterClick, ViewModeActions }) => {
  return (
    <HeaderContainer>
      <LeftSection>
        <NavButtons>
          <Button className="nav-arrow" outline onClick={onPrev}>&lt;</Button>
          <Button className="nav-arrow" outline onClick={onNext}>&gt;</Button>
        </NavButtons>
        <TodayButton primary onClick={onToday}>Hoje</TodayButton>
      </LeftSection>
      
      <Title>{getHeaderTitle(currentDate, viewMode)}</Title>

      <RightSection>
        {ViewModeActions}
        <FilterButton onClick={onFilterClick} title="Filtros avançados">
            <FaFilter size={18}/>
        </FilterButton>
        <NotificationBell />
      </RightSection>
    </HeaderContainer>
  );
};

export default CalendarHeader;
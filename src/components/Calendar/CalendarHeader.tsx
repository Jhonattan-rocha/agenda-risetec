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
}

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-top-left-radius: ${({ theme }) => theme.borderRadius};
  border-top-right-radius: ${({ theme }) => theme.borderRadius};

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const Title = styled.h2`
  margin: 0;
  margin-left: 10px;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const NavButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};

  ${Button} {
    font-size: 1.2rem;
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 50%;
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
  }

  @media (max-width: 768px) {
    ${Button} {
      width: 35px;
      height: 35px;
      font-size: 1rem;
    }
  }
`;

const TodayButton = styled(Button)`
  font-size: 0.9rem;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-left: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: ${({ theme }) => theme.spacing.sm};
    width: 100%;
  }
`;

const FilterButton = styled(Button)`
    margin-left: auto;
    margin-right: ${({ theme }) => theme.spacing.md};
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


const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, onPrev, onNext, onToday, viewMode, onFilterClick }) => {
  return (
    <HeaderContainer>
      <NavButtons>
        <Button outline onClick={onPrev}>&lt;</Button>
        <Button outline onClick={onNext}>&gt;</Button>
      </NavButtons>
      <Title>{getHeaderTitle(currentDate, viewMode)}</Title>
      <FilterButton outline onClick={onFilterClick}>
          <FaFilter />
      </FilterButton>
      <TodayButton primary onClick={onToday}>Hoje</TodayButton>
      <NotificationBell />
    </HeaderContainer>
  );
};

export default CalendarHeader;
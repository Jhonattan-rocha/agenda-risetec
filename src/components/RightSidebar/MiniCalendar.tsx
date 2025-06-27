// src/components/RightSidebar/MiniCalendar.tsx
import React from 'react';
import styled from 'styled-components';
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '../Common';

interface MiniCalendarProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  selectedDate: Date;
}

const MiniCalendarContainer = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md};
  min-width: 250px;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    h4 {
      margin: 0;
      color: ${({ theme }) => theme.colors.textPrimary};
      font-size: 1rem;
    }
    button {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      cursor: pointer;
      transition: ${({ theme }) => theme.transition};
      &:hover {
        color: ${({ theme }) => theme.colors.primary};
      }
    }
  }

  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    span {
      text-align: center;
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      font-weight: 500;
    }
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
`;

const DayCell = styled.div<{ $isCurrentMonth: boolean; $isToday: boolean; $isSelected: boolean; }>`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: ${props => props.$isCurrentMonth ? props.theme.colors.textPrimary : props.theme.colors.textSecondary};
  background-color: ${props => props.$isSelected ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$isSelected ? props.theme.colors.surface : (props.$isCurrentMonth ? props.theme.colors.textPrimary : props.theme.colors.textSecondary)};
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition};
  font-weight: ${props => props.$isToday ? 'bold' : 'normal'};
  border: ${props => props.$isToday ? `1px solid ${props.theme.colors.primary}` : 'none'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}1A;
    ${props => props.$isSelected && `background-color: ${props.theme.colors.primaryLight};`}
  }
`;

const MiniCalendar: React.FC<MiniCalendarProps> = ({ currentDate, onDateClick, selectedDate }) => {
  const startDay = startOfWeek(startOfMonth(currentDate), { locale: ptBR });
  const endDay = endOfWeek(endOfMonth(currentDate), { locale: ptBR });

  const days = [];
  let day = startDay;

  while (day <= endDay) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handlePrevMonth = () => onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <MiniCalendarContainer>
      <div className="header">
        <button onClick={handlePrevMonth}>&lt;</button>
        <h4>{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</h4>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="weekdays">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dayName => (
          <span key={dayName}>{dayName}</span>
        ))}
      </div>
      <div className="days-grid">
        {days.map((day, index) => (
          <DayCell
            key={index}
            $isCurrentMonth={isSameMonth(day, currentDate)}
            $isToday={isToday(day)}
            $isSelected={isSameDay(day, selectedDate)}
            onClick={() => onDateClick(day)}
          >
            {format(day, 'd')}
          </DayCell>
        ))}
      </div>
    </MiniCalendarContainer>
  );
};

export default MiniCalendar;
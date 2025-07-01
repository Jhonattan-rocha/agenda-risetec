// src/components/RightSidebar/Calendars.tsx
import React from 'react';
import styled from 'styled-components';
import { Card } from '../Common';
import type { Calendar } from '../../types';
import { FaPlus } from 'react-icons/fa';
import api from '../../services/axios';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import { usePermission } from '../../hooks/usePermission';

interface CalendarsProps {
  calendars: Calendar[];
  onCalendarClick: (calendar: Calendar) => void;
  onCreateCalendar: () => void;
  onUpdate: () => void;
}

const CalendarsContainer = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md};
  h3 {
    margin-top: 0;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  .calendar-list {
    max-height: 300px;
    overflow-y: auto;
    padding-right: ${({ theme }) => theme.spacing.xs}; // For scrollbar
  }
`;

const CalendarItemWrapper = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
  .color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => props.$color || props.theme.colors.primary};
    margin-right: ${({ theme }) => theme.spacing.sm};
    flex-shrink: 0;
  }
  .calendar-details {
    flex-grow: 1;
    h4 {
      font-size: 0.95rem;
      margin: 0;
      color: ${({ theme }) => theme.colors.textPrimary};
    }
    p {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      margin: 0;
    }
  }
`;

const NoCalendarsMessage = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

const Calendars: React.FC<CalendarsProps> = ({ calendars, onUpdate, onCalendarClick, onCreateCalendar }) => {
  const sortedCalendars = calendars;
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer );
  const canCreateCalendars = usePermission('create', 'calendars');

  return (
    <CalendarsContainer>
      <div style={{ display: 'flex', flexDirection: 'row' }}><h3 style={{ width: '100%' }}>Calendarios</h3>
        {canCreateCalendars && (
          <FaPlus size={24} cursor={'pointer'} onClick={onCreateCalendar} />
        )}
      </div>
      {sortedCalendars.length > 0 ? (
        <div className="calendar-list">
          {sortedCalendars.map(calendar => (
            <CalendarItemWrapper key={calendar.id} $color={calendar.color} onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onCalendarClick?.(calendar);
            }}>
              <div className="color-dot" />
              <div className="calendar-details">
                <h4>{calendar.name}</h4>
              </div>
              <input type='checkbox' checked={calendar.visible} onClick={async (e) => {
                e.stopPropagation();
                await api.put(`/calendar/${calendar.id}`, {...calendar, visible: !calendar.visible }, {
                  headers: {
                    Authorization: `Bearer ${user.token}`
                  }
                });
                onUpdate();
              }}/>
            </CalendarItemWrapper>
          ))}
        </div>
      ) : (
        <NoCalendarsMessage>Nenhum calendario criado.</NoCalendarsMessage>
      )}
    </CalendarsContainer>
  );
};

export default Calendars;
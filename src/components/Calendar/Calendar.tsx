// src/components/Calendar/Calendar.tsx
import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { addMonths, subMonths, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import type { DayInfo, Task, ViewMode } from '../../types';
import { getMonthDays, getWeekDays, getDayInfo, getTasksForDate } from '../../utils/dateUtils';
import { mockTasks } from '../../data/mockTasks';
import CalendarHeader from './CalendarHeader';
import ViewModeSelector from './ViewModeSelector';
import MonthView from './MonthView';
import TaskViewByDate from './TaskViewByDate';
import RightSidebar from '../RightSidebar/RightSideBar';
import { theme } from '../../styles/theme';

const CalendarContainer = styled.div`
  display: flex;
  flex-grow: 1;
  height: 100vh;
  background-color: ${theme.colors.background};
  font-family: ${theme.fonts.body};
`;

const MainContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing.lg};
  max-height: 100vh;
  overflow: hidden;

  @media (max-width: 900px) {
    padding: ${theme.spacing.md};
  }
`;

const CalendarBody = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.surface};
  border-bottom-left-radius: ${theme.borderRadius};
  border-bottom-right-radius: ${theme.borderRadius};
  overflow: hidden; // Ensures content respects border radius
  box-shadow: ${theme.boxShadow};
  position: relative; // For positioning loading/empty states
`;

const ViewWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto; // Allow internal scrolling for views like task list
  padding: ${theme.spacing.md}; // Inner padding for the view content
  position: relative;
  & > * {
    height: 100%; // Make sure children take full height if needed
  }
`;

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // For highlighting in mini-calendar/month view
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [tasks, setTasks] = useState<Task[]>(mockTasks); // Using mock data

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      switch (viewMode) {
        case 'month':
          return direction === 'prev' ? subMonths(prevDate, 1) : addMonths(prevDate, 1);
        case 'week':
          return direction === 'prev' ? subWeeks(prevDate, 1) : addWeeks(prevDate, 1);
        case 'day':
          return direction === 'prev' ? subDays(prevDate, 1) : addDays(prevDate, 1);
        case 'tasks':
        default:
          return prevDate; // No date navigation for tasks view
      }
    });
  }, [viewMode]);

  const handleTodayClick = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date); // Optionally change current date to show selected date's month/week
    // setViewMode('day'); // Optionally switch to day view when a day is clicked
  }, []);

  const renderCalendarView = useMemo(() => {
    let days: DayInfo[] = [];
    switch (viewMode) {
      case 'month':
        days = getMonthDays(currentDate);
        break;
      case 'week':
        days = getWeekDays(currentDate);
        break;
      case 'day':
        days = [getDayInfo(currentDate)]; // Single day
        break;
      case 'tasks':
        // Task view handles its own internal date grouping
        return <TaskViewByDate tasks={tasks} onTaskClick={(task) => { console.log('Task clicked:', task.title); }} />;
      default:
        days = getMonthDays(currentDate);
    }

    // Distribute tasks into dayInfos
    const daysWithTasks = days.map(dayInfo => ({
      ...dayInfo,
      tasks: getTasksForDate(tasks, dayInfo.date),
    }));

    if (viewMode === 'month') {
      return <MonthView days={daysWithTasks} tasks={tasks} onDayClick={handleDateClick} />;
    }
    // TODO: Implement DayView and WeekView similarly
    if (viewMode === 'day') {
        // Simple day view for demonstration
        const todayInfo = daysWithTasks[0] || getDayInfo(currentDate);
        return (
            <TaskViewByDate tasks={todayInfo.tasks} /> // Reuse task view for single day
        );
    }
    if (viewMode === 'week') {
        // Simple week view for demonstration, showing tasks grouped by day
        return (
            <TaskViewByDate tasks={daysWithTasks.flatMap(day => day.tasks)} />
        );
    }
    return null; // Fallback
  }, [currentDate, viewMode, tasks, handleDateClick]);

  return (
    <CalendarContainer>
      <MainContent>
        <ViewModeSelector currentMode={viewMode} onModeChange={setViewMode} />
        <CalendarBody>
          <CalendarHeader
            currentDate={currentDate}
            onPrev={() => navigateDate('prev')}
            onNext={() => navigateDate('next')}
            onToday={handleTodayClick}
            viewMode={viewMode}
          />
          <ViewWrapper>
            {renderCalendarView}
          </ViewWrapper>
        </CalendarBody>
      </MainContent>
      <RightSidebar
        currentDate={currentDate}
        onDateChange={(date) => {
          setCurrentDate(date);
          setSelectedDate(date);
          setViewMode('month'); // Usually mini-calendar jumps to month view of selected date
        }}
        selectedDate={selectedDate}
        tasks={tasks}
      />
    </CalendarContainer>
  );
};

export default Calendar;
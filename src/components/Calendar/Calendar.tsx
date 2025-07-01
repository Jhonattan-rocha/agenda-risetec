// src/components/Calendar/Calendar.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { addMonths, subMonths, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import type { Calendar, DayInfo, Task, ViewMode } from '../../types';
import { getMonthDays, getWeekDays, getDayInfo, getTasksForDate } from '../../utils/dateUtils';
import CalendarHeader from './CalendarHeader';
import ViewModeSelector from './ViewModeSelector';
import MonthView from './MonthView';
import TaskViewByDate from './TaskViewByDate';
import RightSidebar from '../RightSidebar/RightSideBar';
import TaskModal from '../TaskModal';
import api from '../../services/axios';
import CalendarModal from '../CalendarModal';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission'; // Importar hook

const CalendarContainer = styled.div`
  display: flex;
  flex-grow: 1;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  font-family: ${({ theme }) => theme.fonts.body};
`;

const MainContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.lg};
  max-height: 100vh;
  overflow: hidden;

  @media (max-width: 900px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const CalendarBody = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden; // Ensures content respects border radius
  box-shadow: ${({ theme }) => theme.boxShadow};
  position: relative; // For positioning loading/empty states
`;

const ViewWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto; // Allow internal scrolling for views like task list
  padding: ${({ theme }) => theme.spacing.md}; // Inner padding for the view content
  position: relative;
  & > * {
    height: 100%; // Make sure children take full height if needed
  }
`;

const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // For highlighting in mini-calendar/month view
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [calendars, setCalendars] = useState<Array<Calendar>>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]); // Using mock data
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const navigate = useNavigate();
  // Estados para o modal de tarefa
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialDateForNewTask, setInitialDateForNewTask] = useState<Date | undefined>(undefined);

  // calendarios
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarToEdit, setCalendarToEdit] = useState<Calendar | null>(null);
  const canViewAnyCalendar = usePermission('view', 'calendars');

  // O useMemo para `tasks` já filtra baseado nos calendários visíveis, o que é perfeito.
  const tasks = useMemo(() => {
    return allTasks.filter(task => calendars.find(calendar => Number(calendar.id) === Number(task.calendar_id))?.visible );
  }, [allTasks, calendars]);

  const fetchAllTaskas = useCallback(async () => {
    try{
      const req = await api.get("/event", {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const tasks = req.data as Array<Task>;
      setAllTasks(tasks);
    }catch(err){
      console.log(err);
    }
  }, [user]);

  const fetchAllCalendars = useCallback(async () => {
    try {
      const req = await api.get("/calendar", { headers: { Authorization: `Bearer ${user.token}` } });
      const allCalendars = req.data as Array<Calendar>;

      // Filtra os calendários com base na permissão do usuário
      const permittedCalendars = allCalendars.filter(calendar => 
        // Permite se o usuário tem permissão geral ou permissão específica para este calendário
        usePermission('view', `calendar_${calendar.id}`)
      );
      
      // Se o usuário tiver a permissão geral `view` em `calendars`, mostramos todos.
      // Caso contrário, mostramos apenas os permitidos especificamente.
      setCalendars(canViewAnyCalendar ? allCalendars : permittedCalendars);

    } catch(err) {
      console.log(err);
    }
  }, [user.token, canViewAnyCalendar]);

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

  const handleOpenCreateCalendarModal = () => {
    setCalendarToEdit(null);
    setIsCalendarModalOpen(true);
  };

  const handleOpenEditCalendarModal = (calendar: Calendar) => {
    setCalendarToEdit(calendar);
    setIsCalendarModalOpen(true);
  };

  const handleCloseCalendarModal = () => {
    setIsCalendarModalOpen(false);
    setCalendarToEdit(null);
    fetchAllCalendars();
    fetchAllTaskas();
  };

  const handleTodayClick = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date); // Optionally change current date to show selected date's month/week
    // setViewMode('day'); // Optionally switch to day view when a day is clicked
  }, []);

  // Abre o modal para criar uma nova tarefa em uma data específica
  const handleOpenCreateTaskModal = useCallback((date: Date) => {
    handleDateClick(date);
    setInitialDateForNewTask(date);
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  }, [handleDateClick]);

  // Abre o modal para editar uma tarefa existente
  const handleOpenEditTaskModal = useCallback((task: Task) => {
    setTaskToEdit(task);
    setInitialDateForNewTask(undefined); // Não relevante para edição
    setIsTaskModalOpen(true);
  }, []);

  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setTaskToEdit(null);
    setInitialDateForNewTask(undefined);
    fetchAllTaskas();
  }, [fetchAllTaskas]);

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
        return <TaskViewByDate tasks={tasks} onTaskClick={handleOpenEditTaskModal} />;
      default:
        days = getMonthDays(currentDate);
    }

    // Distribute tasks into dayInfos
    const daysWithTasks = days.map(dayInfo => ({
      ...dayInfo,
      tasks: getTasksForDate(tasks, dayInfo.date),
    }));

    if (viewMode === 'month') {
      return (
        <MonthView
          days={daysWithTasks}
          onDayClick={handleOpenCreateTaskModal} // Abre modal de criação
          onTaskClick={handleOpenEditTaskModal}  // Abre modal de edição
        />
      );
    }
    // TODO: Implement DayView and WeekView similarly
    if (viewMode === 'day') {
        // Simple day view for demonstration
        const todayInfo = daysWithTasks[0] || getDayInfo(currentDate);
        return (
            <TaskViewByDate tasks={todayInfo.tasks} onTaskClick={handleOpenEditTaskModal} />
        );
    }
    if (viewMode === 'week') {
        // Simple week view for demonstration, showing tasks grouped by day
        return (
            <TaskViewByDate tasks={daysWithTasks.flatMap(day => day.tasks)} onTaskClick={handleOpenEditTaskModal} />
        );
    }
    return null; // Fallback
  }, [currentDate, viewMode, tasks, handleOpenCreateTaskModal, handleOpenEditTaskModal]);

  useEffect(() => {
    try{
        if(!user.isLoggedIn){
            navigate("/login");            
        }
    }catch(err){
        console.log(err);
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchAllTaskas();
    fetchAllCalendars();
  }, [fetchAllTaskas, fetchAllCalendars]);

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
        calendars={calendars}
        onCalendarClick={handleOpenEditCalendarModal}
        onCreateCalendar={handleOpenCreateCalendarModal}
        currentDate={currentDate}
        onDateChange={(date) => {
          setCurrentDate(date);
          setSelectedDate(date);
          setViewMode('month'); // Usually mini-calendar jumps to month view of selected date
        }}
        onUpdate={() => {
          fetchAllTaskas();
          fetchAllCalendars();
        }}
        selectedDate={selectedDate}
        tasks={tasks}
        onTaskClick={handleOpenEditTaskModal}
      />
      {/* O modal de tarefa */}
      { isTaskModalOpen ? (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          task={taskToEdit}
          initialDate={initialDateForNewTask}
        />
      ) : null }
      { isCalendarModalOpen ? (
        <CalendarModal
          isOpen={isCalendarModalOpen}
          onClose={handleCloseCalendarModal}
          calendar={calendarToEdit}
        />
      ) : null }
    </CalendarContainer>
  );
};

export default CalendarScreen;
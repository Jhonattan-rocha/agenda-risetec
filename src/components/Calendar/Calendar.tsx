// src/components/Calendar/Calendar.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { addMonths, subMonths, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import type { Calendar, DayInfo, Task, ViewMode } from '../../types';
import { getMonthDays, getWeekDays, getDayInfo, getTasksForDate } from '../../utils/dateUtils';
import { mockTasks } from '../../data/mockTasks';
import CalendarHeader from './CalendarHeader';
import ViewModeSelector from './ViewModeSelector';
import MonthView from './MonthView';
import TaskViewByDate from './TaskViewByDate';
import RightSidebar from '../RightSidebar/RightSideBar';
import { theme } from '../../styles/theme';
import TaskModal from '../TaskModal';
import { v4 as uuidv4 } from 'uuid'; // Para gerar IDs únicos para novas tarefas
import api from '../../services/axios';
import CalendarModal from '../CalendarModal';
import { useSelector } from 'react-redux';
import type { AuthState } from '../../store/modules/types';
import { useNavigate } from 'react-router-dom';

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

const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // For highlighting in mini-calendar/month view
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [calendars, setCalendars] = useState<Array<Calendar>>([]);
  const [tasks, setTasks] = useState<Task[]>([]); // Using mock data
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const navigate = useNavigate();
  // Estados para o modal de tarefa
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialDateForNewTask, setInitialDateForNewTask] = useState<Date | undefined>(undefined);

  // calendarios
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarToEdit, setCalendarToEdit] = useState<Calendar | null>(null);

  const fetchAllTaskas = useCallback(async () => {
    try{
      const req = await api.get("/event", {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const tasks = req.data as Array<Task>;
      setTasks(tasks);
    }catch(err){
      console.log(err);
    }
  }, [user]);

  const fetchAllCalendars = useCallback(async () => {
    try{
      const req = await api.get("/calendar", {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const calendars = req.data as Array<Calendar>;
      setCalendars(calendars);
    }catch(err){
      console.log(err);
    }
  }, [user]);

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
  };

  const handleSaveCalendar = (calendar: Calendar) => {
    // Aqui você faria a lógica para salvar o calendário (API call, atualizar estado, etc.)
    console.log('Salvar Calendário:', calendar);
    handleCloseCalendarModal();
  };

  const handleDeleteCalendar = (calendarId: string) => {
    // Aqui você faria a lógica para excluir o calendário
    console.log('Excluir Calendário ID:', calendarId);
    handleCloseCalendarModal();
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

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    handleCloseTaskModal();
  }, [handleCloseTaskModal]);

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
          tasks={tasks}
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
        selectedDate={selectedDate}
        tasks={tasks}
        onTaskClick={handleOpenEditTaskModal}
      />
      {/* O modal de tarefa */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        task={taskToEdit}
        onDelete={handleDeleteTask}
        initialDate={initialDateForNewTask}
      />
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={handleCloseCalendarModal}
        calendar={calendarToEdit}
        onSave={handleSaveCalendar}
        onDelete={handleDeleteCalendar} // Passa a função de exclusão se necessário
      />
    </CalendarContainer>
  );
};

export default CalendarScreen;
// src/components/Calendar/Calendar.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { addMonths, subMonths, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import type { Calendar, DayInfo, Profile, Task, User, ViewMode } from '../../types';
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
import { usePermission } from '../../hooks/usePermission'; 

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
  overflow: hidden; 
  box-shadow: ${({ theme }) => theme.boxShadow};
  position: relative; 
`;

const ViewWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto; 
  padding: ${({ theme }) => theme.spacing.md}; 
  position: relative;
  & > * {
    height: 100%; 
  }
`;

// NOVO: Componente de filtro de usuário
const FilterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterLabel = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;


const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [calendars, setCalendars] = useState<Array<Calendar>>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const navigate = useNavigate();

  // Estados para modais
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialDateForNewTask, setInitialDateForNewTask] = useState<Date | undefined>(undefined);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarToEdit, setCalendarToEdit] = useState<Calendar | null>(null);
  
  // NOVO: Estados para o filtro de usuário
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIdFilter, setSelectedUserIdFilter] = useState<string>('');

  const canViewAnyCalendar = usePermission('view', 'calendars', user.user.profile as Profile);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await api.get('/user', { headers: { Authorization: `Bearer ${user.token}` } });
      setAllUsers(response.data);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    }
  }, [user.token]);

  const fetchAllCalendars = useCallback(async () => {
    try {
      const req = await api.get("/calendar", { headers: { Authorization: `Bearer ${user.token}` } });
      const allCalendars = req.data as Array<Calendar>;
      const permittedCalendars = allCalendars.filter(calendar => 
        usePermission('view', `calendar_${calendar.id}`, user.user.profile as Profile)
      );
      setCalendars(canViewAnyCalendar ? allCalendars : permittedCalendars);
    } catch(err) {
      console.log(err);
    }
  }, [user.token, canViewAnyCalendar]);

  const fetchAllTaskas = useCallback(async () => {
    try{
      // NOVO: Adiciona o filtro de usuário à requisição
      const params = new URLSearchParams();
      if (selectedUserIdFilter) {
        // A chave 'user_id' e o modelo 'Events' devem corresponder ao que o backend espera
        const filterValue = `{"user_id": ${selectedUserIdFilter}}`;
        params.append('filters', filterValue);
        params.append('model', 'Events');
      }

      const req = await api.get("/event", {
        headers: { Authorization: `Bearer ${user.token}` },
        params
      });
      const tasks = req.data as Array<Task>;
      setAllTasks(tasks);
    }catch(err){
      console.log(err);
    }
  }, [user, selectedUserIdFilter]); // Adiciona o filtro como dependência

  // MELHORADO: A lógica de filtragem de tarefas agora é mais clara e segura.
  const tasks = useMemo(() => {
    // Cria um conjunto de IDs de calendários permitidos para busca rápida
    const permittedCalendarIds = new Set(calendars.map(c => Number(c.id)));
    
    return allTasks.filter(task => {
      // 1. A tarefa deve pertencer a um calendário que o usuário tem permissão para ver
      const hasPermission = permittedCalendarIds.has(Number(task.calendar_id));
      if (!hasPermission) return false;

      // 2. O calendário ao qual a tarefa pertence deve estar marcado como 'visível'
      const calendarOfTask = calendars.find(c => Number(c.id) === Number(task.calendar_id));
      const isVisible = calendarOfTask?.visible ?? false; // Garante que é um booleano

      return isVisible;
    });
  }, [allTasks, calendars]);


  useEffect(() => {
    if(!user.isLoggedIn){
        navigate("/login");            
    } else {
      fetchAllTaskas();
      fetchAllCalendars();
      fetchAllUsers();
    }
  }, [user, navigate, fetchAllTaskas, fetchAllCalendars, fetchAllUsers]);


  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      switch (viewMode) {
        case 'month':
          return direction === 'prev' ? subMonths(prevDate, 1) : addMonths(prevDate, 1);
        case 'week':
          return direction === 'prev' ? subWeeks(prevDate, 1) : addWeeks(prevDate, 1);
        case 'day':
          return direction === 'prev' ? subDays(prevDate, 1) : addDays(prevDate, 1);
        default:
          return prevDate;
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
    setCurrentDate(date);
  }, []);

  const handleOpenCreateTaskModal = useCallback((date: Date) => {
    handleDateClick(date);
    setInitialDateForNewTask(date);
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  }, [handleDateClick]);

  const handleOpenEditTaskModal = useCallback((task: Task) => {
    setTaskToEdit(task);
    setInitialDateForNewTask(undefined);
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
        days = [getDayInfo(currentDate)];
        break;
      case 'tasks':
        return <TaskViewByDate tasks={tasks} onTaskClick={handleOpenEditTaskModal} />;
      default:
        days = getMonthDays(currentDate);
    }

    const daysWithTasks = days.map(dayInfo => ({
      ...dayInfo,
      tasks: getTasksForDate(tasks, dayInfo.date),
    }));

    if (viewMode === 'month') {
      return (
        <MonthView
          days={daysWithTasks}
          onDayClick={handleOpenCreateTaskModal}
          onTaskClick={handleOpenEditTaskModal}
        />
      );
    }
    if (viewMode === 'day') {
        const todayInfo = daysWithTasks[0] || getDayInfo(currentDate);
        return <TaskViewByDate tasks={todayInfo.tasks} onTaskClick={handleOpenEditTaskModal} />;
    }
    if (viewMode === 'week') {
        return <TaskViewByDate tasks={daysWithTasks.flatMap(day => day.tasks)} onTaskClick={handleOpenEditTaskModal} />;
    }
    return null;
  }, [currentDate, viewMode, tasks, handleOpenCreateTaskModal, handleOpenEditTaskModal]);

  return (
    <CalendarContainer>
      <MainContent>
        {/* NOVO: Adiciona o seletor de filtro */}
        <FilterContainer>
            <FilterLabel htmlFor="user-filter">Filtrar por usuário:</FilterLabel>
            <FilterSelect 
              id="user-filter"
              value={selectedUserIdFilter}
              onChange={e => setSelectedUserIdFilter(e.target.value)}
            >
              <option value="">Todos</option>
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </FilterSelect>
        </FilterContainer>

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
          setViewMode('month');
        }}
        onUpdate={() => {
          fetchAllTaskas();
          fetchAllCalendars();
        }}
        selectedDate={selectedDate}
        tasks={tasks} // Passa a lista de tarefas já filtrada
        onTaskClick={handleOpenEditTaskModal}
      />
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
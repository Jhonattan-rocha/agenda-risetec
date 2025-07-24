// src/components/Calendar/Calendar.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { addMonths, subMonths, addDays, subDays, addWeeks, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
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
import FilterModal, { type FilterOption } from '../FilterModal';
import { RRule } from 'rrule';

const HEADER_HEIGHT = '45px';

const CalendarContainer = styled.div`
  display: flex;
  height: calc(100vh - ${HEADER_HEIGHT});
  background-color: ${({ theme }) => theme.colors.background};
  font-family: ${({ theme }) => theme.fonts.body};

  @media (max-width: 900px) {
    flex-direction: column;
    height: auto;
  }
`;

const MainContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow: hidden;

  @media (max-width: 900px) {
    padding: ${({ theme }) => theme.spacing.md};
    order: 1;
    overflow: visible;
  }
`;

const CalendarBody = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.boxShadow};
  position: relative;
`;

const ViewWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  position: relative;
  padding: ${({ theme }) => theme.spacing.md};

  @media (max-width: 900px) {
    overflow-y: visible;
    padding: ${({ theme }) => theme.spacing.sm};
  }

  & > * {
    height: 100%;
  }
`;

const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [calendars, setCalendars] = useState<Array<Calendar>>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const navigate = useNavigate();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialDateForNewTask, setInitialDateForNewTask] = useState<Date | undefined>(undefined);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarToEdit, setCalendarToEdit] = useState<Calendar | null>(null);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [taskFilters, setTaskFilters] = useState<string>('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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
  }, [user.token, user.user.profile, canViewAnyCalendar]);

  const fetchAllTaskas = useCallback(async () => {
    try {
      const req = await api.get("/event", {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { filters: taskFilters, limit: 1000 }
      });
      setAllTasks(req.data as Array<Task>);
    } catch(err) {
      console.log(err);
    }
  }, [user.token, taskFilters]);

  const tasks = useMemo(() => {
    const visibleCalendarIds = new Set(calendars.filter(c => c.visible).map(c => Number(c.id)));
    const expandedTasks: Task[] = [];

    // Define a janela de tempo para expandir os eventos recorrentes (ex: 2 meses para trás, 6 para frente)
    const rangeStart = subMonths(startOfMonth(currentDate), 2);
    const rangeEnd = addMonths(endOfMonth(currentDate), 6);

    allTasks.forEach(task => {
        if (!visibleCalendarIds.has(Number(task.calendar_id))) {
            return;
        }

        if (task.recurring_rule) {
            try {
                const rule = RRule.fromString(`DTSTART:${new Date(task.date).toISOString().replace(/[-:.]/g, '')}\n${task.recurring_rule}`);
                
                rule.between(rangeStart, rangeEnd).forEach((occurrenceDate, i) => {
                    const duration = task.endDate ? new Date(task.endDate).getTime() - new Date(task.date).getTime() : 0;
                    
                    expandedTasks.push({
                        ...task,
                        id: `${task.id}-recur-${i}`, // Cria um ID único para a ocorrência
                        date: occurrenceDate,
                        endDate: task.endDate ? new Date(occurrenceDate.getTime() + duration) : undefined,
                    });
                });

            } catch (e) {
                console.error("Erro ao processar regra de recorrência:", e);
                expandedTasks.push(task); // Adiciona o evento original se a regra falhar
            }
        } else {
            expandedTasks.push(task);
        }
    });

    return expandedTasks;
  }, [allTasks, calendars, currentDate]);


  useEffect(() => {
    if(!user.isLoggedIn){
        navigate("/login");
    } else {
      fetchAllTaskas();
      fetchAllCalendars();
      fetchAllUsers();
    }
  }, [user, navigate, fetchAllTaskas, fetchAllCalendars, fetchAllUsers]);

  const taskFilterOptions = useMemo((): FilterOption[] => [
    { key: 'title', label: 'Título da Tarefa', type: 'text', operator: 'ct' },
    { key: 'status', label: 'Status', type: 'select', operator: 'eq',
      options: [
        { value: 'confirmed', label: 'Confirmado' },
        { value: 'tentative', label: 'Pendente' },
        { value: 'cancelled', label: 'Cancelado' },
      ]
    },
    { key: 'users.id', label: 'Participante', type: 'select', operator: 'eq',
      options: allUsers.map(u => ({ value: u.id, label: u.name }))
    },
    { key: 'location', label: 'Localização', type: 'text', operator: 'ct' }
  ], [allUsers]);

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
        <ViewModeSelector currentMode={viewMode} onModeChange={setViewMode} />
        <CalendarBody>
          <CalendarHeader
            currentDate={currentDate}
            onPrev={() => navigateDate('prev')}
            onNext={() => navigateDate('next')}
            onToday={handleTodayClick}
            viewMode={viewMode}
            onFilterClick={() => setIsFilterModalOpen(true)}
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
        tasks={tasks}
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
      <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={taskFilterOptions}
          onApplyFilters={setTaskFilters}
      />
    </CalendarContainer>
  );
};

export default CalendarScreen;
import React, { useState, useEffect, useCallback } from 'react';
import { TimeLog } from '@/types';
import { useTimeLogging } from '@/hooks/useTimeLogging';
import ProgressBar from './ProgressBar';
import WeeklyCalendarView from './timesheet/WeeklyCalendarView';

const TimesheetView: React.FC = () => {
  const { timeLogs, updateTimeLog, deleteTimeLog, refreshTimeLogs } = useTimeLogging();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Listen for switch to daily view event
  useEffect(() => {
    const handleSwitchToDailyView = () => {
      console.log('[TimesheetView] Switching to daily view');
      setViewMode('daily');
    };

    const handleTimeLogsUpdated = () => {
      console.log('[TimesheetView] Time logs updated, triggering refresh');
      // Force a refresh by updating the refresh trigger
      setRefreshTrigger(prev => prev + 1);
      // Also ensure we're in daily view when time logs are updated
      setViewMode('daily');
    };

    const handleForceRefreshDailyView = () => {
      console.log('[TimesheetView] Force refreshing daily view');
      // Force a refresh by updating the refresh trigger
      setRefreshTrigger(prev => prev + 1);
      // Also ensure we're in daily view
      setViewMode('daily');
      // Refresh time logs from API
      refreshTimeLogs();
    };

    window.addEventListener('switchToDailyView', handleSwitchToDailyView);
    window.addEventListener('time-logs-updated', handleTimeLogsUpdated);
    window.addEventListener('stopwatch-log-saved', handleTimeLogsUpdated);
    window.addEventListener('force-refresh-daily-view', handleForceRefreshDailyView);

    return () => {
      window.removeEventListener('switchToDailyView', handleSwitchToDailyView);
      window.removeEventListener('time-logs-updated', handleTimeLogsUpdated);
      window.removeEventListener('stopwatch-log-saved', handleTimeLogsUpdated);
      window.removeEventListener('force-refresh-daily-view', handleForceRefreshDailyView);
    };
  }, [refreshTimeLogs]);

  const getCurrentDayTotal = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return timeLogs
      .filter(log => log.date === today)
      .reduce((total, log) => total + log.duration, 0);
  }, [timeLogs]);

  const currentDayTotal = getCurrentDayTotal();

  // Handle adding a new time log
  const handleAddTimeLog = useCallback((newLog: TimeLog) => {
    // This function is now handled by the useTimeLogging hook
    // The hook will automatically update the timeLogs state
    console.log('[TimesheetView] New time log added via hook:', newLog);
    // Force a refresh by updating the refresh trigger
    setRefreshTrigger(prev => prev + 1);
    // Switch to daily view
    setViewMode('daily');
    // Dispatch events to ensure DailyView is updated with the new entry
    window.dispatchEvent(new CustomEvent('time-logs-updated'));
  }, []);

  // Handle updating an existing time log
  const handleUpdateTimeLog = useCallback((updatedLog: TimeLog) => {
    console.log('[TimesheetView] Updating time log:', updatedLog);
    updateTimeLog(updatedLog.id, updatedLog);
    // Force a refresh by updating the refresh trigger
    setRefreshTrigger(prev => prev + 1);
  }, [updateTimeLog]);

  // Handle deleting a time log
  const handleDeleteTimeLog = useCallback((logToDelete: TimeLog) => {
    console.log('[TimesheetView] Deleting time log:', logToDelete);
    deleteTimeLog(logToDelete.id);
    // Force a refresh by updating the refresh trigger
    setRefreshTrigger(prev => prev + 1);
  }, [deleteTimeLog]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Progress Bar */}
      <div className="w-full max-w-full mx-auto px-4 pt-4">
        <ProgressBar
          currentHours={currentDayTotal / 3600}
          targetHours={8}
          color="#0A84FF" // Apple blue color
          enabled={true}
        />
      </div>

      {/* Apple-style Weekly/Daily Calendar View */}
      <div className="flex-1 w-full max-w-full mx-auto px-4 pb-4 mt-6 overflow-hidden">
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm p-6 h-full">
          <WeeklyCalendarView
            key={`calendar-view-${refreshTrigger}`}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            timeLogs={timeLogs}
            onAddTimeLog={handleAddTimeLog}
            onUpdateTimeLog={handleUpdateTimeLog}
            onDeleteTimeLog={handleDeleteTimeLog}
            initialViewMode={viewMode}
            onViewModeChange={setViewMode}
            forceRefresh={refreshTrigger}
          />
        </div>
      </div>
    </div>
  );
};

export default TimesheetView;
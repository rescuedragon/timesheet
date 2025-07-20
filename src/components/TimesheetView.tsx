import React, { useState, useEffect } from 'react';
import { TimeLog } from '@/types';
import { useTimeLogging } from '@/hooks/useTimeLogging';
import ProgressBar from './ProgressBar';
import WeeklyCalendarView from './timesheet/WeeklyCalendarView';

const TimesheetView: React.FC = () => {
  const { timeLogs, updateTimeLog, deleteTimeLog } = useTimeLogging();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');

  // Listen for switch to daily view event
  useEffect(() => {
    const handleSwitchToDailyView = () => {
      console.log('TimesheetView - switching to daily view');
      setViewMode('daily');
    };

    window.addEventListener('switchToDailyView', handleSwitchToDailyView);

    return () => {
      window.removeEventListener('switchToDailyView', handleSwitchToDailyView);
    };
  }, []);

  const getCurrentDayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return timeLogs
      .filter(log => log.date === today)
      .reduce((total, log) => total + log.duration, 0);
  };

  const currentDayTotal = getCurrentDayTotal();

  // Handle adding a new time log
  const handleAddTimeLog = (newLog: TimeLog) => {
    // This function is now handled by the useTimeLogging hook
    // The hook will automatically update the timeLogs state
    console.log('New time log added via hook:', newLog);
  };

  // Handle updating an existing time log
  const handleUpdateTimeLog = (updatedLog: TimeLog) => {
    console.log('Updating time log:', updatedLog);
    updateTimeLog(updatedLog.id, updatedLog);
  };

  // Handle deleting a time log
  const handleDeleteTimeLog = (logToDelete: TimeLog) => {
    console.log('Deleting time log:', logToDelete);
    deleteTimeLog(logToDelete.id);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Progress Bar */}
      <div className="w-full max-w-full mx-auto px-4 pt-4">
        <ProgressBar
          currentHours={currentDayTotal}
          targetHours={8}
          color="#0A84FF" // Apple blue color
          enabled={true}
        />
      </div>

      {/* Apple-style Weekly/Daily Calendar View */}
      <div className="flex-1 w-full max-w-full mx-auto px-4 pb-4 mt-6 overflow-hidden">
        <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm p-6 h-full">
          <WeeklyCalendarView
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            timeLogs={timeLogs}
            onAddTimeLog={handleAddTimeLog}
            onUpdateTimeLog={handleUpdateTimeLog}
            onDeleteTimeLog={handleDeleteTimeLog}
            initialViewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default TimesheetView; 
import React, { useState, useEffect } from 'react';
import { TimeLog } from '@/types';
import { storageService } from '@/services/storageService';
import ProgressBar from './ProgressBar';
import WeeklyCalendarView from './timesheet/WeeklyCalendarView';

const TimesheetView: React.FC = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');

  // Function to load time logs from storage
  const loadTimeLogs = () => {
    // Get logs directly from localStorage to ensure we have the latest data
    let logs;
    try {
      const saved = localStorage.getItem('timesheet-logs');
      logs = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading time logs:', error);
      logs = [];
    }

    // If no logs exist, create a sample entry for today
    if (!logs || logs.length === 0) {
      const today = new Date().toISOString().split('T')[0];

      const sampleEntry: TimeLog = {
        id: `sample_${Date.now()}`,
        projectId: 'project_123',
        subprojectId: 'subproject_456',
        projectName: 'Marketing Campaign',
        subprojectName: 'Subproject 6',
        startTime: '09:00',
        endTime: '17:00',
        duration: 28800, // 8 hours in seconds
        description: 'Created sample marketing materials',
        date: today
      };

      logs = [sampleEntry];
      storageService.saveTimeLogs(logs);
    }

    console.log('TimesheetView - loaded time logs:', logs);
    setTimeLogs(logs);
  };

  // Load initial time logs
  useEffect(() => {

    loadTimeLogs();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'timesheet-logs') {
        loadTimeLogs();
      }
    };

    // Listen for custom events
    const handleTimeLogsUpdate = () => {
      loadTimeLogs();
      // Don't automatically switch to daily view when a time log is updated
    };

    // Listen for switch to daily view event
    const handleSwitchToDailyView = () => {
      console.log('TimesheetView - switching to daily view');
      // Clear the cache to force a fresh load of time logs
      storageService.clearAllCache();
      // Load the latest time logs
      loadTimeLogs();
      // Switch to daily view
      setViewMode('daily');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('time-logs-updated', handleTimeLogsUpdate);
    window.addEventListener('switch-to-daily-view', handleSwitchToDailyView);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('time-logs-updated', handleTimeLogsUpdate);
      window.removeEventListener('switch-to-daily-view', handleSwitchToDailyView);
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
    // Generate a unique ID for the new log if not already present
    const logWithId = {
      ...newLog,
      id: newLog.id || `log_${Date.now()}`
    };

    console.log('Adding new time log:', logWithId);

    // Add to state and storage
    const updatedLogs = [...timeLogs, logWithId];
    setTimeLogs(updatedLogs);
    storageService.saveTimeLogs(updatedLogs);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('time-logs-updated'));
  };

  // Handle updating an existing time log
  const handleUpdateTimeLog = (updatedLog: TimeLog) => {
    console.log('Updating time log:', updatedLog);

    const updatedLogs = timeLogs.map(log =>
      log.id === updatedLog.id ? updatedLog : log
    );

    setTimeLogs(updatedLogs);
    storageService.saveTimeLogs(updatedLogs);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('time-logs-updated'));
  };

  // Handle deleting a time log
  const handleDeleteTimeLog = (logToDelete: TimeLog) => {
    console.log('Deleting time log:', logToDelete);

    const updatedLogs = timeLogs.filter(log => log.id !== logToDelete.id);

    setTimeLogs(updatedLogs);
    storageService.saveTimeLogs(updatedLogs);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('time-logs-updated'));
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
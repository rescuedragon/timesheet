import React, { useState, useEffect } from 'react';
import { TimeLog } from '@/types';
import { storageService } from '@/services/storageService';
import ProgressBar from './ProgressBar';
import WeeklyCalendarView from './timesheet/WeeklyCalendarView';

const TimesheetView: React.FC = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Load initial time logs
  useEffect(() => {
    const loadTimeLogs = () => {
      const logs = storageService.getTimeLogs();
      console.log('TimesheetView - loaded time logs:', logs);
      setTimeLogs(logs);
    };
    
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
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('time-logs-updated', handleTimeLogsUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('time-logs-updated', handleTimeLogsUpdate);
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
    // Generate a unique ID for the new log
    const logWithId = {
      ...newLog,
      id: `log_${Date.now()}`
    };
    
    // Add to state and storage
    const updatedLogs = [...timeLogs, logWithId];
    setTimeLogs(updatedLogs);
    storageService.saveTimeLogs(updatedLogs);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('time-logs-updated'));
  };
  
  // Handle updating an existing time log
  const handleUpdateTimeLog = (updatedLog: TimeLog) => {
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
    const updatedLogs = timeLogs.filter(log => log.id !== logToDelete.id);
    
    setTimeLogs(updatedLogs);
    storageService.saveTimeLogs(updatedLogs);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('time-logs-updated'));
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4">
      {/* Progress Bar */}
      <ProgressBar
        currentHours={currentDayTotal}
        targetHours={8}
        color="#006994"
        enabled={true}
      />
      
      {/* Apple-style Weekly/Daily Calendar View */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm p-6">
        <WeeklyCalendarView 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          timeLogs={timeLogs}
          onAddTimeLog={handleAddTimeLog}
          onUpdateTimeLog={handleUpdateTimeLog}
          onDeleteTimeLog={handleDeleteTimeLog}
        />
      </div>
    </div>
  );
};

export default TimesheetView; 
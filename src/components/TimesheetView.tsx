import React, { useState, useEffect } from 'react';
import { TimeLog } from '@/types';
import { storageService } from '@/services/storageService';
import ProgressBar from './ProgressBar';

const TimesheetView: React.FC = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  
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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4">
      {/* Progress Bar */}
      <ProgressBar
        currentHours={currentDayTotal}
        targetHours={8}
        color="#006994"
        enabled={true}
      />
    </div>
  );
};

export default TimesheetView; 
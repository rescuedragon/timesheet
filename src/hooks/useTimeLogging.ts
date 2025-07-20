// Custom hook for time logging operations
// Manages time log creation, updates, and persistence

import { useState, useEffect, useCallback } from 'react';
import { TimeLog } from '@/types';
import { storageService } from '@/services/storageService';
import { apiService } from '@/services/apiService';
import { formatDateString, getCurrentTimeString } from '@/utils/timeUtils';

export const useTimeLogging = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);

  // Load time logs on mount
  useEffect(() => {
    const loadTimeLogs = async () => {
      try {
        // First load from localStorage for immediate display
        const localTimeLogs = storageService.getTimeLogs();
        setTimeLogs(localTimeLogs);
        
        // Then fetch from API and update
        const apiTimeLogs = await apiService.getTimeLogs();
        setTimeLogs(apiTimeLogs);
        
        // Update localStorage with the latest data from API
        storageService.saveTimeLogs(apiTimeLogs);
      } catch (error) {
        console.error('Failed to load time logs from API:', error);
        // Fall back to localStorage if API fails
        const localTimeLogs = storageService.getTimeLogs();
        setTimeLogs(localTimeLogs);
      }
    };
    
    loadTimeLogs();
  }, []);

  // Save time logs whenever they change
  useEffect(() => {
    storageService.saveTimeLogs(timeLogs);
    // Dispatch event to notify other components that time logs have been updated
    window.dispatchEvent(new CustomEvent('time-logs-updated'));
  }, [timeLogs]);

  const logTime = useCallback(async (
    duration: number,
    description: string,
    startTime: Date,
    endTime: Date,
    projectId: string,
    subprojectId: string,
    projectName: string,
    subprojectName: string
  ) => {
    const newTimeLogData = {
      projectId,
      subprojectId,
      projectName,
      subprojectName,
      duration,
      description,
      date: formatDateString(new Date()),
      startTime: startTime.toLocaleTimeString(),
      endTime: endTime.toLocaleTimeString()
    };

    try {
      // Save to database via API
      const savedTimeLog = await apiService.createTimeLog(newTimeLogData);
      
      // Update local state
      setTimeLogs(prev => {
        const updated = [savedTimeLog, ...prev];
        storageService.saveTimeLogs(updated);
        window.dispatchEvent(new CustomEvent('time-logs-updated'));
        return updated;
      });
      
      return savedTimeLog;
    } catch (error) {
      console.error('Failed to save time log to database:', error);
      
      // Fall back to local storage only if API fails
      const localTimeLog = {
        id: Date.now().toString(),
        ...newTimeLogData
      };
      
      setTimeLogs(prev => {
        const updated = [localTimeLog, ...prev];
        storageService.saveTimeLogs(updated);
        window.dispatchEvent(new CustomEvent('time-logs-updated'));
        return updated;
      });
      
      return localTimeLog;
    }
  }, []);

  const updateTimeLog = useCallback(async (logId: string, updates: Partial<TimeLog>) => {
    try {
      // Update in database via API
      const updatedLog = await apiService.updateTimeLog(logId, updates);
      
      // Update local state
      setTimeLogs(prev => prev.map(log => 
        log.id === logId ? updatedLog : log
      ));
      
      // Update localStorage
      const currentLogs = storageService.getTimeLogs();
      const updatedLogs = currentLogs.map(log => 
        log.id === logId ? updatedLog : log
      );
      storageService.saveTimeLogs(updatedLogs);
    } catch (error) {
      console.error('Failed to update time log in database:', error);
      
      // Fall back to local update only if API fails
      setTimeLogs(prev => prev.map(log => 
        log.id === logId ? { ...log, ...updates } : log
      ));
      
      const currentLogs = storageService.getTimeLogs();
      const updatedLogs = currentLogs.map(log => 
        log.id === logId ? { ...log, ...updates } : log
      );
      storageService.saveTimeLogs(updatedLogs);
    }
  }, []);

  const deleteTimeLog = useCallback(async (logId: string) => {
    try {
      // Delete from database via API
      await apiService.deleteTimeLog(logId);
      
      // Update local state
      setTimeLogs(prev => prev.filter(log => log.id !== logId));
      
      // Update localStorage
      const currentLogs = storageService.getTimeLogs();
      const updatedLogs = currentLogs.filter(log => log.id !== logId);
      storageService.saveTimeLogs(updatedLogs);
    } catch (error) {
      console.error('Failed to delete time log from database:', error);
      
      // Fall back to local delete only if API fails
      setTimeLogs(prev => prev.filter(log => log.id !== logId));
      
      const currentLogs = storageService.getTimeLogs();
      const updatedLogs = currentLogs.filter(log => log.id !== logId);
      storageService.saveTimeLogs(updatedLogs);
    }
  }, []);

  const updateLogDuration = useCallback((logId: string, newDuration: number) => {
    updateTimeLog(logId, { duration: newDuration });
  }, [updateTimeLog]);

  const getLogsByProject = useCallback((projectId: string) => {
    return timeLogs.filter(log => log.projectId === projectId);
  }, [timeLogs]);

  const getLogsBySubproject = useCallback((projectId: string, subprojectId: string) => {
    return timeLogs.filter(log => 
      log.projectId === projectId && log.subprojectId === subprojectId
    );
  }, [timeLogs]);

  const getLogsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return timeLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });
  }, [timeLogs]);

  const getTodaysLogs = useCallback(() => {
    const today = formatDateString(new Date());
    return timeLogs.filter(log => log.date === today);
  }, [timeLogs]);

  return {
    timeLogs,
    logTime,
    updateTimeLog,
    deleteTimeLog,
    updateLogDuration,
    getLogsByProject,
    getLogsBySubproject,
    getLogsByDateRange,
    getTodaysLogs
  };
};
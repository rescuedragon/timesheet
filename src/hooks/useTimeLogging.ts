// Custom hook for time logging operations
// Manages time log creation, updates, and persistence

import { useState, useEffect, useCallback } from 'react';
import { TimeLog } from '@/types';
import { storageService } from '@/services/storageService';
import { apiService } from '@/services/apiService';
import { formatDateString, getCurrentTimeString } from '@/utils/timeUtils';

export const useTimeLogging = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load time logs on mount and when reload events are triggered
  useEffect(() => {
    const loadTimeLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('[useTimeLogging] Loading time logs');
        
        // First load from localStorage for immediate display
        const localTimeLogs = storageService.getTimeLogs();
        setTimeLogs(localTimeLogs);
        
        // Then fetch from API and update
        const apiTimeLogs = await apiService.getTimeLogs();
        console.log('[useTimeLogging] Loaded time logs from API:', apiTimeLogs);
        setTimeLogs(apiTimeLogs);
        
        // Update localStorage with the latest data from API
        storageService.saveTimeLogs(apiTimeLogs);
      } catch (err) {
        console.error('[useTimeLogging] Failed to load time logs from API:', err);
        setError(err instanceof Error ? err : new Error('Failed to load time logs'));
        
        // Fall back to localStorage if API fails
        const localTimeLogs = storageService.getTimeLogs();
        setTimeLogs(localTimeLogs);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Load time logs initially
    loadTimeLogs();
    
    // Set up event listeners for reloading time logs
    const handleReloadTimeLogs = () => {
      console.log('[useTimeLogging] Reloading time logs from API');
      loadTimeLogs();
    };
    
    // Use a single event for reloading time logs
    window.addEventListener('time-logs-updated', handleReloadTimeLogs);
    window.addEventListener('stopwatch-log-saved', handleReloadTimeLogs);
    
    return () => {
      window.removeEventListener('time-logs-updated', handleReloadTimeLogs);
      window.removeEventListener('stopwatch-log-saved', handleReloadTimeLogs);
    };
  }, []);

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
    // Enhanced validation for project and subproject information
    if (!projectId || projectId === '') {
      console.error('[useTimeLogging] Missing projectId:', { projectId });
      throw new Error('Missing project ID');
    }
    
    if (!subprojectId || subprojectId === '') {
      console.error('[useTimeLogging] Missing subprojectId:', { subprojectId });
      throw new Error('Missing subproject ID');
    }
    
    if (!projectName || projectName === '') {
      console.error('[useTimeLogging] Missing projectName:', { projectName });
      throw new Error('Missing project name');
    }
    
    if (!subprojectName || subprojectName === '') {
      console.error('[useTimeLogging] Missing subprojectName:', { subprojectName });
      throw new Error('Missing subproject name');
    }
    
    const newTimeLogData = {
      projectId,
      subprojectId,
      projectName,
      subprojectName,
      duration,
      description,
      date: formatDateString(startTime), // Use the startTime date instead of current date
      startTime: startTime.toLocaleTimeString(),
      endTime: endTime.toLocaleTimeString()
    };

    console.log('[useTimeLogging] Creating new time log with data:', newTimeLogData);

    try {
      // Save to database via API
      const savedTimeLog = await apiService.createTimeLog(newTimeLogData);
      console.log('[useTimeLogging] Successfully saved time log to database:', savedTimeLog);
      
      // Verify the saved time log has project and subproject information
      if (!savedTimeLog.projectId || !savedTimeLog.subprojectId) {
        console.warn('[useTimeLogging] API returned time log without project/subproject information:', savedTimeLog);
        // Add the missing information if needed
        savedTimeLog.projectId = savedTimeLog.projectId || projectId;
        savedTimeLog.subprojectId = savedTimeLog.subprojectId || subprojectId;
        savedTimeLog.projectName = savedTimeLog.projectName || projectName;
        savedTimeLog.subprojectName = savedTimeLog.subprojectName || subprojectName;
      }
      
      // Update local state
      setTimeLogs(prev => {
        const updated = [savedTimeLog, ...prev];
        storageService.saveTimeLogs(updated);
        
        // Dispatch a single event to notify components that time logs have been updated
        window.dispatchEvent(new CustomEvent('time-logs-updated'));
        
        return updated;
      });
      
      return savedTimeLog;
    } catch (err) {
      console.error('[useTimeLogging] Failed to save time log to database:', err);
      setError(err instanceof Error ? err : new Error('Failed to save time log'));
      
      // Fall back to local storage only if API fails
      const localTimeLog = {
        id: Date.now().toString(),
        ...newTimeLogData
      };
      
      setTimeLogs(prev => {
        const updated = [localTimeLog, ...prev];
        storageService.saveTimeLogs(updated);
        
        // Dispatch a single event with all necessary data
        window.dispatchEvent(new CustomEvent('stopwatch-log-saved', { 
          detail: { 
            log: localTimeLog,
            projectId: localTimeLog.projectId,
            subprojectId: localTimeLog.subprojectId,
            projectName: localTimeLog.projectName,
            subprojectName: localTimeLog.subprojectName
          }
        }));
        
        // Switch to timesheet tab
        window.dispatchEvent(new CustomEvent('switchToTimesheetTab'));
        
        return updated;
      });
      
      return localTimeLog;
    }
  }, []);

  const updateTimeLog = useCallback(async (logId: string, updates: Partial<TimeLog>) => {
    try {
      console.log(`[useTimeLogging] Updating time log ${logId} with:`, updates);
      
      // Update in database via API
      const updatedLog = await apiService.updateTimeLog(logId, updates);
      
      // Update local state
      setTimeLogs(prev => {
        const updated = prev.map(log => log.id === logId ? updatedLog : log);
        storageService.saveTimeLogs(updated);
        
        // Dispatch event to notify components
        window.dispatchEvent(new CustomEvent('time-logs-updated'));
        
        return updated;
      });
      
      return updatedLog;
    } catch (err) {
      console.error('[useTimeLogging] Failed to update time log in database:', err);
      setError(err instanceof Error ? err : new Error('Failed to update time log'));
      
      // Fall back to local update only if API fails
      setTimeLogs(prev => {
        const updated = prev.map(log => log.id === logId ? { ...log, ...updates } : log);
        storageService.saveTimeLogs(updated);
        
        // Dispatch event to notify components
        window.dispatchEvent(new CustomEvent('time-logs-updated'));
        
        return updated;
      });
    }
  }, []);

  const deleteTimeLog = useCallback(async (logId: string) => {
    try {
      console.log(`[useTimeLogging] Deleting time log ${logId}`);
      
      // Delete from database via API
      await apiService.deleteTimeLog(logId);
      
      // Update local state
      setTimeLogs(prev => {
        const updated = prev.filter(log => log.id !== logId);
        storageService.saveTimeLogs(updated);
        
        // Dispatch event to notify components
        window.dispatchEvent(new CustomEvent('time-logs-updated'));
        
        return updated;
      });
    } catch (err) {
      console.error('[useTimeLogging] Failed to delete time log from database:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete time log'));
      
      // Fall back to local delete only if API fails
      setTimeLogs(prev => {
        const updated = prev.filter(log => log.id !== logId);
        storageService.saveTimeLogs(updated);
        
        // Dispatch event to notify components
        window.dispatchEvent(new CustomEvent('time-logs-updated'));
        
        return updated;
      });
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

  const refreshTimeLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[useTimeLogging] Manually refreshing time logs');
      const apiTimeLogs = await apiService.getTimeLogs();
      setTimeLogs(apiTimeLogs);
      storageService.saveTimeLogs(apiTimeLogs);
    } catch (err) {
      console.error('[useTimeLogging] Failed to refresh time logs:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh time logs'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    timeLogs,
    isLoading,
    error,
    logTime,
    updateTimeLog,
    deleteTimeLog,
    updateLogDuration,
    getLogsByProject,
    getLogsBySubproject,
    getLogsByDateRange,
    getTodaysLogs,
    refreshTimeLogs
  };
};
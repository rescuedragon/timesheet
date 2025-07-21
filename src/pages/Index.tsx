import React, { useState, useEffect, useCallback } from 'react';
import TimeTracker from '@/components/TimeTracker';
import Holidays from '@/components/Holidays';
import LoginPage from '@/components/LoginPage';
import HeaderControls from '@/components/common/HeaderControls';
import AppHeader from '@/components/common/AppHeader';
import MainTabs from '@/components/common/MainTabs';
import ApiDebug from '@/components/ApiDebug';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTimeLogging } from '@/hooks/useTimeLogging';
import { storageService } from '@/services/storageService';

const Index = React.memo(() => {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('is-logged-in', false);
  const [activeTab, setActiveTab] = useState('tracker');

  // --- LIFTED STATE ---
  const { timeLogs, logTime, refreshTimeLogs } = useTimeLogging();
  
  const addTimeLog = (newLog) => {
    console.log('[Index] addTimeLog called with:', newLog);
    // The useTimeLogging hook will handle the state management
    // This function is kept for backward compatibility
  };
  
  const replaceTimeLogs = (logs) => {
    // This function is kept for backward compatibility
    // The useTimeLogging hook handles state management
    console.log('[Index] replaceTimeLogs called with:', logs);
  };
  // --- END LIFTED STATE ---

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
  }, [setIsLoggedIn]);



  const handleSwitchToDaily = useCallback(() => {
    console.log('[Index] Switching to Daily view');
    setActiveTab('data');
    
    // Add a small delay to ensure the tab has switched
    setTimeout(() => {
      console.log('[Index] Dispatching time-logs-updated event');
      window.dispatchEvent(new CustomEvent('time-logs-updated'));
      window.dispatchEvent(new CustomEvent('force-refresh-daily-view'));
    }, 300);
  }, []);
  
  const handleSwitchToTimesheetTab = useCallback((event) => {
    console.log('[Index] Switching to Timesheet tab');
    setActiveTab('data');
    
    // Add a small delay to ensure the tab has switched
    setTimeout(() => {
      console.log('[Index] Dispatching switchToDailyView event');
      window.dispatchEvent(new CustomEvent('switchToDailyView'));
      window.dispatchEvent(new CustomEvent('time-logs-updated'));
      window.dispatchEvent(new CustomEvent('force-refresh-daily-view'));
      
      // Force a refresh of time logs from API
      refreshTimeLogs();
    }, 300);
  }, [refreshTimeLogs]);

  useEffect(() => {
    window.addEventListener('switchToDailyView', handleSwitchToDaily);
    window.addEventListener('switchToTimesheetTab', handleSwitchToTimesheetTab);
    
    return () => {
      window.removeEventListener('switchToDailyView', handleSwitchToDaily);
      window.removeEventListener('switchToTimesheetTab', handleSwitchToTimesheetTab);
    };
  }, [handleSwitchToDaily, handleSwitchToTimesheetTab]);

  const handleClearStorage = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  const handleForceReloadProjects = useCallback(() => {
    storageService.clearAllCache();
    window.location.reload();
  }, []);

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <div className="pastel-gradient-bg" />
      <div className="glass-bg-overlay" />
      {/* Background layers above */}
      <HeaderControls
        onClearStorage={handleClearStorage}
        onForceReloadProjects={handleForceReloadProjects}
      />
      
      <AppHeader>
        <MainTabs activeTab={activeTab} onTabChange={setActiveTab} timeLogs={timeLogs} addTimeLog={addTimeLog} replaceTimeLogs={replaceTimeLogs} />
      </AppHeader>
      
      {/* Temporary API Debug Component */}
      <div className="fixed bottom-4 right-4 z-50">
        <ApiDebug />
      </div>
    </>
  );
});

Index.displayName = 'Index';

export default Index;
import React, { useState, useEffect, useCallback } from 'react';
import TimeTracker from '@/components/TimeTracker';
import ExcelView from '@/components/ExcelView';
import Holidays from '@/components/Holidays';
import LoginPage from '@/components/LoginPage';
import HeaderControls from '@/components/common/HeaderControls';
import AppHeader from '@/components/common/AppHeader';
import MainTabs from '@/components/common/MainTabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTimeLogging } from '@/hooks/useTimeLogging';
import { storageService } from '@/services/storageService';

const Index = React.memo(() => {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('is-logged-in', false);
  const [activeTab, setActiveTab] = useState('tracker');

  // --- LIFTED STATE ---
  const { timeLogs, logTime } = useTimeLogging();
  
  const addTimeLog = (newLog) => {
    console.log('Index.tsx - addTimeLog called with:', newLog);
    // The useTimeLogging hook will handle the state management
    // This function is kept for backward compatibility
  };
  
  const replaceTimeLogs = (logs) => {
    // This function is kept for backward compatibility
    // The useTimeLogging hook handles state management
    console.log('Index.tsx - replaceTimeLogs called with:', logs);
  };
  // --- END LIFTED STATE ---

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
  }, [setIsLoggedIn]);

  const handleSwitchToExcel = useCallback(() => {
    setActiveTab('data');
  }, []);

  const handleSwitchToDaily = useCallback(() => {
    setActiveTab('data');
  }, []);
  
  const handleSwitchToTimesheetTab = useCallback((event) => {
    setActiveTab('data');
    // Dispatch another event to notify TimesheetView to switch to daily view
    window.dispatchEvent(new CustomEvent('switch-to-daily-view'));
  }, []);

  useEffect(() => {
    window.addEventListener('switchToExcelView', handleSwitchToExcel);
    window.addEventListener('switchToDailyView', handleSwitchToDaily);
    window.addEventListener('switchToTimesheetTab', handleSwitchToTimesheetTab);
    
    return () => {
      window.removeEventListener('switchToExcelView', handleSwitchToExcel);
      window.removeEventListener('switchToDailyView', handleSwitchToDaily);
      window.removeEventListener('switchToTimesheetTab', handleSwitchToTimesheetTab);
    };
  }, [handleSwitchToExcel, handleSwitchToDaily, handleSwitchToTimesheetTab]);

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
    </>
  );
});

Index.displayName = 'Index';

export default Index;
import React, { useState, useEffect, useCallback } from 'react';
import TimeTracker from '@/components/TimeTracker';
import ExcelView from '@/components/ExcelView';
import Holidays from '@/components/Holidays';
import LoginPage from '@/components/LoginPage';
import HeaderControls from '@/components/common/HeaderControls';
import AppHeader from '@/components/common/AppHeader';
import MainTabs from '@/components/common/MainTabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { storageService } from '@/services/storageService';

const Index = React.memo(() => {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('is-logged-in', false);
  const [activeTab, setActiveTab] = useState('tracker');

  // --- LIFTED STATE ---
  const [timeLogs, setTimeLogs] = useState(() => {
    const saved = localStorage.getItem('timesheet-logs');
    return saved ? JSON.parse(saved) : [];
  });
  const addTimeLog = (newLog) => {
    console.log('Index.tsx - addTimeLog called with:', newLog);
    setTimeLogs(prev => {
      const updated = newLog ? [newLog, ...prev] : prev;
      localStorage.setItem('timesheet-logs', JSON.stringify(updated));
      console.log('Index.tsx - saved logs to localStorage:', updated);
      // Dispatch event to notify TimesheetView
      window.dispatchEvent(new CustomEvent('time-logs-updated'));
      return updated;
    });
  };
  const replaceTimeLogs = (logs) => {
    setTimeLogs(logs);
    localStorage.setItem('timesheet-logs', JSON.stringify(logs));
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
        <MainTabs activeTab={activeTab} onTabChange={setActiveTab} timeLogs={timeLogs} addTimeLog={addTimeLog} setTimeLogs={setTimeLogs} replaceTimeLogs={replaceTimeLogs} />
      </AppHeader>
    </>
  );
});

Index.displayName = 'Index';

export default Index;
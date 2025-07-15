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
  const [isDarkMode, setIsDarkMode] = useLocalStorage('dark-mode', false);

  // --- LIFTED STATE ---
  const [timeLogs, setTimeLogs] = useState(() => {
    const saved = localStorage.getItem('timesheet-logs');
    return saved ? JSON.parse(saved) : [];
  });
  const addTimeLog = (newLog) => {
    setTimeLogs(prev => {
      const updated = newLog ? [newLog, ...prev] : prev;
      localStorage.setItem('timesheet-logs', JSON.stringify(updated));
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

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSwitchToExcel = useCallback(() => {
    setActiveTab('data');
  }, []);

  const handleSwitchToDaily = useCallback(() => {
    setActiveTab('data');
  }, []);

  useEffect(() => {
    window.addEventListener('switchToExcelView', handleSwitchToExcel);
    window.addEventListener('switchToDailyView', handleSwitchToDaily);
    
    return () => {
      window.removeEventListener('switchToExcelView', handleSwitchToExcel);
      window.removeEventListener('switchToDailyView', handleSwitchToDaily);
    };
  }, [handleSwitchToExcel, handleSwitchToDaily]);

  const handleDarkModeToggle = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode, setIsDarkMode]);

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
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
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
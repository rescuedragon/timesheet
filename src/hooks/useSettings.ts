import { useState } from 'react';

export const useSettings = () => {
  // Progress bar settings
  const [progressBarEnabled, setProgressBarEnabled] = useState(() => {
    const saved = localStorage.getItem('progressbar-enabled');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [progressBarColor, setProgressBarColor] = useState(() => {
    const saved = localStorage.getItem('progressbar-color');
    return saved || '#10b981';
  });

  // Color-coded projects settings
  const [colorCodedProjectsEnabled, setColorCodedProjectsEnabled] = useState(() => {
    const saved = localStorage.getItem('color-coded-projects-enabled');
    return saved ? JSON.parse(saved) : false;
  });

  // Frequent subprojects settings
  const [frequentSubprojectsEnabled, setFrequentSubprojectsEnabled] = useState(() => {
    const saved = localStorage.getItem('frequent-subprojects-enabled');
    return saved ? JSON.parse(saved) : false;
  });

  // Get projects from localStorage
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('timesheet-projects');
    return saved ? JSON.parse(saved) : [];
  });

  // Get holidays from localStorage
  const [holidays, setHolidays] = useState(() => {
    const saved = localStorage.getItem('timesheet-holidays');
    return saved ? JSON.parse(saved) : [];
  });

  const handleProgressBarToggle = (enabled: boolean) => {
    setProgressBarEnabled(enabled);
    localStorage.setItem('progressbar-enabled', JSON.stringify(enabled));
    window.dispatchEvent(new CustomEvent('settings-changed'));
  };

  const handleProgressBarColorChange = (color: string) => {
    setProgressBarColor(color);
    localStorage.setItem('progressbar-color', color);
    window.dispatchEvent(new CustomEvent('settings-changed'));
  };

  // Update setProjects and setHolidays to dispatch event
  const setProjectsWithEvent = (projects: any[]) => {
    setProjects(projects);
    localStorage.setItem('timesheet-projects', JSON.stringify(projects));
    window.dispatchEvent(new CustomEvent('settings-changed'));
  };

  const setHolidaysWithEvent = (holidays: any[]) => {
    setHolidays(holidays);
    localStorage.setItem('timesheet-holidays', JSON.stringify(holidays));
    window.dispatchEvent(new CustomEvent('settings-changed'));
  };

  const handleColorCodedProjectsToggle = (enabled: boolean) => {
    setColorCodedProjectsEnabled(enabled);
    localStorage.setItem('color-coded-projects-enabled', JSON.stringify(enabled));
    window.dispatchEvent(new CustomEvent('settings-changed'));
  };

  const handleFrequentSubprojectsToggle = (enabled: boolean) => {
    setFrequentSubprojectsEnabled(enabled);
    localStorage.setItem('frequent-subprojects-enabled', JSON.stringify(enabled));
    window.dispatchEvent(new CustomEvent('settings-changed'));
  };

  return {
    progressBarEnabled,
    progressBarColor,
    colorCodedProjectsEnabled,
    frequentSubprojectsEnabled,
    projects,
    setProjects: setProjectsWithEvent,
    holidays,
    setHolidays: setHolidaysWithEvent,
    handleProgressBarToggle,
    handleProgressBarColorChange,
    handleColorCodedProjectsToggle,
    handleFrequentSubprojectsToggle
  };
}; 
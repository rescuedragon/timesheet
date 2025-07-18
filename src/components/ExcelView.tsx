import React from 'react';
import ProgressBar from './ProgressBar';

const ExcelView: React.FC<{ timeLogs: any[]; addTimeLog: (newLog: any) => void; setTimeLogs: React.Dispatch<any>; replaceTimeLogs: (logs: any[]) => void }> = ({ timeLogs, addTimeLog, setTimeLogs, replaceTimeLogs }) => {
  // Progress bar settings - always enabled
  const [progressBarColor, setProgressBarColor] = React.useState('#006994'); // Ocean blue

  // Get current day's total time
  const getCurrentDayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return timeLogs
      .filter(log => log.date === today)
      .reduce((total, log) => total + log.duration, 0);
  };

  return (
    <div className="w-[95%] mx-auto space-y-6">
      <ProgressBar
        currentHours={getCurrentDayTotal()}
        targetHours={8}
        color={progressBarColor}
        enabled={true}
      />
    </div>
  );
};

export default ExcelView;
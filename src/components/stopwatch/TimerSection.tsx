import React from 'react';
import StopwatchDisplay from '../timesheet/StopwatchDisplay';
import StopwatchControls from '../timesheet/StopwatchControls';

interface TimerSectionProps {
  isRunning: boolean;
  elapsedTime: number;
  displayTime: number;
  canStart: boolean;
  canPauseOrStop: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  selectedProject?: any;
  selectedSubproject?: any;
}

const TimerSection: React.FC<TimerSectionProps> = ({
  isRunning,
  elapsedTime,
  displayTime,
  canStart,
  canPauseOrStop,
  onStart,
  onPause,
  onStop,
  selectedProject,
  selectedSubproject
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-0 min-w-0 flex-1">
      {/* Timer Display with Apple-style spacing */}
      <div className="flex items-center justify-center mb-12">
        <div 
          className="transition-all duration-500 ease-out"
          style={{
            transform: isRunning ? 'scale(1.02)' : 'scale(1)',
            filter: isRunning ? 'drop-shadow(0 8px 32px rgba(99, 102, 241, 0.15))' : 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.08))'
          }}
        >
          <StopwatchDisplay
            isRunning={isRunning}
            elapsedTime={elapsedTime}
            displayTime={displayTime}
          />
        </div>
      </div>
      
      {/* Controls with refined spacing */}
      <div className="flex items-center justify-center">
        <div 
          className="transition-all duration-300 ease-out"
          style={{
            transform: isRunning ? 'translateY(0)' : 'translateY(2px)',
            opacity: isRunning ? 1 : 0.95
          }}
        >
          <StopwatchControls
            isRunning={isRunning}
            canStart={canStart}
            canPauseOrStop={canPauseOrStop}
            onStart={onStart}
            onPause={onPause}
            onStop={onStop}
            compact={!!(selectedProject && selectedSubproject)}
          />
        </div>
      </div>
    </div>
  );
};

export default TimerSection; 
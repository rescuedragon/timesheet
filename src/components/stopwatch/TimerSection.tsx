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
      <div className="flex items-center justify-center">
        <StopwatchDisplay
          isRunning={isRunning}
          elapsedTime={elapsedTime}
          displayTime={displayTime}
        />
      </div>
      <div className="mt-8 flex items-center justify-center">
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
  );
};

export default TimerSection; 
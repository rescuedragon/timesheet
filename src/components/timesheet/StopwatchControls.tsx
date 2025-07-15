// Stopwatch control buttons component
// Handles start, pause, and stop functionality with visual feedback

import React from 'react';
import { Play, Pause, Square } from 'lucide-react';

interface StopwatchControlsProps {
  isRunning: boolean;
  canStart: boolean;
  canPauseOrStop: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  compact?: boolean;
}

const StopwatchControls: React.FC<StopwatchControlsProps> = ({
  isRunning,
  canStart,
  canPauseOrStop,
  onStart,
  onPause,
  onStop,
  compact = false
}) => {
  const buttonBaseStyle = compact
    ? "relative h-10 px-4 rounded-xl font-medium text-base font-sans transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    : "relative h-14 px-8 rounded-2xl font-medium text-lg font-sans transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  const minWidth = compact ? { minWidth: '90px' } : { minWidth: '140px' };

  return (
    <div className="flex items-center gap-4 z-10">
      {!isRunning ? (
        <button
          onClick={onStart}
          disabled={!canStart}
          className={`${buttonBaseStyle} bg-black text-white shadow-[0_4px_20px_rgba(0,0,0,0.18)] hover:bg-neutral-900 active:bg-neutral-950 border border-neutral-800`} // Matte black
          style={minWidth}
        >
          <span className="relative z-10 flex items-center justify-center">
            <Play className="h-5 w-5 mr-3" strokeWidth={2} />
            Start
          </span>
        </button>
      ) : (
        <button
          onClick={onStop}
          disabled={!canPauseOrStop}
          className={`${buttonBaseStyle} bg-black text-white shadow-[0_4px_20px_rgba(0,0,0,0.18)] hover:bg-neutral-900 active:bg-neutral-950 border border-neutral-800`} // Matte black
          style={minWidth}
        >
          <span className="relative z-10 flex items-center justify-center">
            <Square className="h-5 w-5 mr-3" strokeWidth={2} />
            Stop
          </span>
        </button>
      )}
      
      <button
        onClick={onPause}
        disabled={!canPauseOrStop}
        className={`${buttonBaseStyle} bg-white/90 text-black border border-border shadow-[0_4px_20px_rgba(0,0,0,0.10)] hover:bg-white active:bg-gray-100 backdrop-blur-xl`} // Glassmorphism, matches header
        style={minWidth}
      >
        <span className="relative z-10 flex items-center justify-center">
          <Pause className="h-5 w-5 mr-3" strokeWidth={2} />
          Pause
        </span>
      </button>
    </div>
  );
};

export default StopwatchControls;
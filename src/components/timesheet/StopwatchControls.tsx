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
    ? "relative h-12 px-6 rounded-xl font-semibold text-base font-sans transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] focus:outline-none overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    : "relative h-14 px-8 rounded-2xl font-semibold text-lg font-sans transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] focus:outline-none overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  const minWidth = compact ? { minWidth: '110px' } : { minWidth: '140px' };

  return (
    <div className="flex items-center gap-6 z-10">
      {!isRunning ? (
        <button
          onClick={onStart}
          disabled={!canStart}
          className={`${buttonBaseStyle} text-white shadow-[0_8px_32px_rgba(126,46,255,0.3)] hover:shadow-[0_12px_40px_rgba(126,46,255,0.4)] border border-transparent backdrop-blur-sm`}
          style={{
            ...minWidth,
            background: 'linear-gradient(135deg, #7E2EFF 0%, #6366f1 100%)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9 0%, #5856eb 100%)';
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(126, 46, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #7E2EFF 0%, #6366f1 100%)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(126, 46, 255, 0.3)';
          }}
        >
          <span className="relative z-10 flex items-center justify-center">
            <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" strokeWidth={2.5} />
            Start
          </span>
          {/* Shimmer effect */}
          <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </button>
      ) : (
        <button
          onClick={onStop}
          disabled={!canPauseOrStop}
          className={`${buttonBaseStyle} text-white shadow-[0_8px_32px_rgba(239,68,68,0.3)] hover:shadow-[0_12px_40px_rgba(239,68,68,0.4)] border border-transparent backdrop-blur-sm`}
          style={{
            ...minWidth,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(239, 68, 68, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(239, 68, 68, 0.3)';
          }}
        >
          <span className="relative z-10 flex items-center justify-center">
            <Square className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" strokeWidth={2.5} />
            Stop
          </span>
          {/* Shimmer effect */}
          <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </button>
      )}
      
      <button
        onClick={onPause}
        disabled={!canPauseOrStop}
        className={`${buttonBaseStyle} text-gray-700 border border-gray-300/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl`}
        style={{
          ...minWidth,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.9) 100%)';
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
          e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)';
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.borderColor = 'rgba(209, 213, 219, 0.5)';
        }}
      >
        <span className="relative z-10 flex items-center justify-center">
          <Pause className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" strokeWidth={2.5} />
          Pause
        </span>
        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-gray-200/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </button>
    </div>
  );
};

export default StopwatchControls;
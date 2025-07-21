/**
 * StopwatchDisplay Component
 * Renders a circular timer with animated background effects
 */

import React from 'react';
import { formatTime } from '@/utils/timeUtils';

/**
 * Props interface for StopwatchDisplay component
 */
interface StopwatchDisplayProps {
  isRunning: boolean;      // Whether the stopwatch is currently running
  elapsedTime: number;     // Total elapsed time in seconds
  displayTime: number;     // Time to display in seconds (may differ from elapsed time)
  duration?: number;       // Optional total duration in seconds (for progress ring)
}

/**
 * Component that displays the current time in a circular display
 * with animated background effects when running
 */
const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({
  isRunning,
  elapsedTime,
  displayTime,
  duration = 3600 // default to 1 hour if not provided
}) => {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center overflow-hidden rounded-full" 
         style={{ 
           background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)', 
           boxShadow: isRunning 
             ? '0 8px 32px rgba(126, 46, 255, 0.15), 0 4px 16px rgba(99, 102, 241, 0.1)' 
             : '0 4px 20px rgba(0, 0, 0, 0.08)',
           border: '1px solid rgba(255, 255, 255, 0.6)'
         }}>
      
      {/* Animated Background Glow - Only shown when timer is running */}
      {isRunning && (
        <div className="absolute inset-0 rounded-full opacity-30">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-spin" 
               style={{ animationDuration: '8s' }}></div>
          <div className="absolute inset-2 rounded-full bg-white"></div>
        </div>
      )}
      
      {/* Timer Text Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <div className={`text-5xl font-medium tracking-tighter font-mono px-4 select-none transition-all duration-300 ${
          isRunning ? 'scale-105' : 'scale-100'
        }`} style={{ 
          fontWeight: 300, 
          color: isRunning ? '#7E2EFF' : '#6366f1',
          fontVariantNumeric: 'tabular-nums',
          textShadow: isRunning ? '0 2px 8px rgba(126, 46, 255, 0.2)' : 'none'
        }}>
          {formatTime(displayTime)}
        </div>
      </div>
    </div>
  );
};

export default StopwatchDisplay;
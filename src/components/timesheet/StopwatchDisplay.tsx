// Stopwatch timer display with aurora animation
// Renders the circular timer with animated background effects

import React from 'react';
import { formatTime } from '@/utils/timeUtils';

interface StopwatchDisplayProps {
  isRunning: boolean;
  elapsedTime: number; // in seconds
  displayTime: number; // in seconds
  duration?: number; // total duration in seconds (optional, for progress ring)
}

const CIRCLE_SIZE = 256;
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE / 2) - (STROKE_WIDTH / 2);
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({
  isRunning,
  elapsedTime,
  displayTime,
  duration = 3600 // default to 1 hour if not provided
}) => {
  // Calculate progress (0 to 1)
  const progress = Math.min(elapsedTime / duration, 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center overflow-hidden rounded-full" 
         style={{ 
           background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)', 
           boxShadow: isRunning 
             ? '0 8px 32px rgba(126, 46, 255, 0.15), 0 4px 16px rgba(99, 102, 241, 0.1)' 
             : '0 4px 20px rgba(0, 0, 0, 0.08)',
           border: '1px solid rgba(255, 255, 255, 0.6)'
         }}>
      
      {/* Animated Background Glow */}
      {isRunning && (
        <div className="absolute inset-0 rounded-full opacity-30">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-spin" 
               style={{ animationDuration: '8s' }}></div>
          <div className="absolute inset-2 rounded-full bg-white"></div>
        </div>
      )}
      
      {/* Progress Ring */}
      <svg className="absolute inset-0 w-full h-full transform -rotate-90" style={{ filter: 'drop-shadow(0 2px 8px rgba(126, 46, 255, 0.2))' }}>
        {/* Background Ring */}
        <circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke="rgba(126, 46, 255, 0.1)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        
        {/* Progress Ring */}
        <circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke="url(#progressGradient)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: isRunning ? 'drop-shadow(0 0 8px rgba(126, 46, 255, 0.4))' : 'none'
          }}
        />
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7E2EFF" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Pulsing Center Dot */}
      {isRunning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" 
               style={{ 
                 boxShadow: '0 0 20px rgba(126, 46, 255, 0.6)',
                 animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
               }}></div>
        </div>
      )}
      
      {/* Timer Text */}
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
        
        {/* Status Indicator */}
        {isRunning && (
          <div className="mt-2 text-xs font-medium text-purple-600 uppercase tracking-wider animate-pulse">
            Recording
          </div>
        )}
      </div>
    </div>
  );
};

export default StopwatchDisplay;
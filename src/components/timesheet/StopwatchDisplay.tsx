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
          <div className="relative w-64 h-64 flex items-center justify-center overflow-hidden rounded-full" style={{ background: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
      {/* SVG Progress Ring and Border - Removed */}
      {/* Timer Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <div className="text-5xl font-medium tracking-tighter font-mono px-4 select-none" style={{ 
          fontWeight: 300, 
          color: '#6366f1',
          fontVariantNumeric: 'tabular-nums'
        }}>
          {formatTime(displayTime)}
        </div>
      </div>
    </div>
  );
};

export default StopwatchDisplay;
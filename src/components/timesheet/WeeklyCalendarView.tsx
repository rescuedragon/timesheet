import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';

interface WeeklyCalendarViewProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  timeLogs?: any[];
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  selectedDate = new Date(),
  onDateChange,
  timeLogs = []
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  
  // Calculate week days whenever the current date changes
  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const days = [];
    
    for (let i = 0; i < 5; i++) { // Show 5 days (Mon-Fri)
      days.push(addDays(start, i));
    }
    
    setWeekDays(days);
  }, [currentDate]);
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, 7));
  };
  
  // Go to current week
  const goToCurrentWeek = () => {
    setCurrentDate(new Date());
  };
  
  // Calculate hours for a specific day
  const getHoursForDay = (date: Date) => {
    const dayTotal = timeLogs
      .filter(log => isSameDay(new Date(log.date), date))
      .reduce((total, log) => total + log.duration, 0);
    
    return (dayTotal / 3600).toFixed(1);
  };
  
  // Calculate total hours for the week
  const getWeekTotal = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    const weekTotal = timeLogs
      .filter(log => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= weekEnd;
      })
      .reduce((total, log) => total + log.duration, 0);
    
    return (weekTotal / 3600).toFixed(1);
  };
  
  return (
    <div className="w-full">
      {/* View Toggle */}
      <div className="flex mb-4">
        <div className="w-full grid grid-cols-2 gap-1 bg-gray-100/80 dark:bg-gray-800/30 p-1 rounded-xl backdrop-blur-sm">
          <button 
            className="py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(240,240,247,0.9))',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 1px 1px rgba(0,0,0,0.03)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Weekly View
          </button>
          <button 
            className="py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <line x1="3" y1="16" x2="21" y2="16"></line>
            </svg>
            Daily View
          </button>
        </div>
      </div>
      
      {/* Week Header */}
      <div className="flex items-center justify-between mb-4 bg-gray-900/95 dark:bg-gray-800/95 text-white rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <div>
          <h2 className="text-lg font-semibold">
            {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')} - 
            {format(endOfWeek(currentDate, { weekStartsOn: 1 }), ' MMM d, yyyy')}
          </h2>
          <p className="text-sm text-gray-300">{getWeekTotal()} hours this week</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={goToPreviousWeek}
            className="p-2 rounded-lg bg-gray-800/80 dark:bg-gray-700/80 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            aria-label="Previous week"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button 
            onClick={goToCurrentWeek}
            className="px-4 py-2 rounded-lg bg-gray-700/90 dark:bg-gray-600/90 hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
          >
            This Week
          </button>
          <button 
            onClick={goToNextWeek}
            className="p-2 rounded-lg bg-gray-800/80 dark:bg-gray-700/80 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            aria-label="Next week"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Days Grid */}
      <div className="grid grid-cols-5 gap-4">
        {weekDays.map((day, index) => {
          const dayHours = getHoursForDay(day);
          const isToday = isSameDay(day, new Date());
          const hasHours = parseFloat(dayHours) > 0;
          
          return (
            <div 
              key={index}
              className={`flex flex-col items-center p-4 rounded-xl border ${
                isToday 
                  ? 'bg-white/90 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-700/50' 
                  : 'bg-white/80 dark:bg-gray-900/80 border-gray-200/30 dark:border-gray-800/30'
              } hover:shadow-md transition-all duration-200 backdrop-blur-sm`}
              onClick={() => onDateChange && onDateChange(day)}
            >
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {format(day, 'EEE')}
              </span>
              <span className="text-4xl font-bold my-1">
                {format(day, 'd')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(day, 'MMM yyyy')}
              </span>
              <div 
                className={`mt-4 w-full py-2 px-4 rounded-lg text-center font-medium ${
                  hasHours
                    ? 'bg-gray-800/90 text-white' 
                    : 'bg-gray-200/80 dark:bg-gray-800/50 text-gray-700 dark:text-gray-400'
                }`}
                style={{
                  boxShadow: hasHours ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {dayHours} hours
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
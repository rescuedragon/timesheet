import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import DailyView from './DailyView';
import TimeEntryDialog from './TimeEntryDialog';
import { TimeLog } from '@/types';

interface WeeklyCalendarViewProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  timeLogs?: TimeLog[];
  onAddTimeLog?: (log: TimeLog) => void;
  onUpdateTimeLog?: (log: TimeLog) => void;
  onDeleteTimeLog?: (log: TimeLog) => void;
  initialViewMode?: 'weekly' | 'daily';
  onViewModeChange?: (mode: 'weekly' | 'daily') => void;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  selectedDate = new Date(),
  onDateChange,
  timeLogs = [],
  onAddTimeLog,
  onUpdateTimeLog,
  onDeleteTimeLog,
  initialViewMode = 'weekly',
  onViewModeChange
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>(initialViewMode);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeLog | undefined>(undefined);
  
  // Update viewMode when initialViewMode changes
  useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);
  
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
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    const dayTotal = timeLogs
      .filter(log => {
        // Compare the formatted date strings directly
        return log.date === formattedDate;
      })
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
  
  // Handle day selection
  const handleDaySelect = (day: Date) => {
    setCurrentDate(day);
    setViewMode('daily');
    if (onDateChange) {
      onDateChange(day);
    }
  };
  
  // Handle adding a new entry
  const handleAddEntry = () => {
    setCurrentEntry(undefined);
    setIsEntryDialogOpen(true);
  };
  
  // Handle editing an entry
  const handleEditEntry = (entry: TimeLog) => {
    setCurrentEntry(entry);
    setIsEntryDialogOpen(true);
  };
  
  // Handle saving an entry
  const handleSaveEntry = (entry: TimeLog) => {
    if (currentEntry) {
      // Update existing entry
      if (onUpdateTimeLog) {
        onUpdateTimeLog(entry);
      }
    } else {
      // Add new entry
      if (onAddTimeLog) {
        onAddTimeLog(entry);
      }
    }
    
    // Close the dialog
    setIsEntryDialogOpen(false);
    
    // Switch to daily view to show the entry
    setViewMode('daily');
    if (onViewModeChange) {
      onViewModeChange('daily');
    }
    
    // Make sure the current date matches the entry date
    if (entry.date) {
      try {
        const entryDate = new Date(entry.date);
        setCurrentDate(entryDate);
        if (onDateChange) {
          onDateChange(entryDate);
        }
      } catch (error) {
        console.error('Error parsing entry date:', error);
      }
    }
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* View Toggle - Apple Style Segmented Control */}
      <div className="flex mb-6">
        <div className="w-full flex justify-center">
          <div className="inline-flex bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-lg shadow-sm p-1">
            <button 
              onClick={() => {
                setViewMode('weekly');
                if (onViewModeChange) onViewModeChange('weekly');
              }}
              className={`py-1 px-3 flex items-center justify-center text-sm font-medium transition-all duration-200 rounded-md ${
                viewMode === 'weekly' 
                  ? 'bg-white dark:bg-[#3A3A3C] text-black dark:text-white shadow-sm' 
                  : 'bg-transparent text-[#8E8E93] dark:text-[#8E8E93]'
              }`}
            >
              <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Weekly View
            </button>
            <button 
              onClick={() => {
                setViewMode('daily');
                if (onViewModeChange) onViewModeChange('daily');
              }}
              className={`py-1 px-3 flex items-center justify-center text-sm font-medium transition-all duration-200 rounded-md ${
                viewMode === 'daily' 
                  ? 'bg-white dark:bg-[#3A3A3C] text-black dark:text-white shadow-sm' 
                  : 'bg-transparent text-[#8E8E93] dark:text-[#8E8E93]'
              }`}
            >
              <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      </div>
      
      {viewMode === 'weekly' ? (
        <>
          {/* Week Header - Modern Apple Style Card */}
          <div className="flex items-center justify-between mb-6 bg-[#4299e1] text-white rounded-xl p-4 shadow-sm">
            <div>
              <h2 className="text-base font-medium">
                {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')} - 
                {format(endOfWeek(currentDate, { weekStartsOn: 1 }), ' MMM d, yyyy')}
              </h2>
              <p className="text-sm text-white/90">{getWeekTotal()} hours this week</p>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={goToPreviousWeek}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Previous week"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button 
                onClick={goToCurrentWeek}
                className="px-4 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
              >
                This Week
              </button>
              <button 
                onClick={goToNextWeek}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Next week"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Days Grid - Modern Apple Style Cards */}
          <div className="grid grid-cols-5 gap-4 flex-1">
            {weekDays.map((day, index) => {
              const dayHours = getHoursForDay(day);
              const isToday = isSameDay(day, new Date());
              const hasHours = parseFloat(dayHours) > 0;
              
              return (
                <div 
                  key={index}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isToday 
                      ? 'bg-[#F2F2F7] dark:bg-[#2C2C2E]' 
                      : 'bg-white dark:bg-[#1C1C1E]'
                  } hover:shadow-md`}
                  onClick={() => handleDaySelect(day)}
                  style={{
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(209, 209, 214, 0.5)'
                  }}
                >
                  <span className="text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-2xl font-semibold my-1 ${isToday ? 'text-[#4299e1]' : 'text-[#000000] dark:text-white'}`}>
                    {format(day, 'd')}
                  </span>
                  <span className="text-xs text-[#8E8E93] dark:text-[#8E8E93]">
                    {format(day, 'MMM yyyy')}
                  </span>
                  <div 
                    className={`mt-3 w-full py-1.5 px-3 rounded-md text-center font-medium text-sm ${
                      hasHours
                        ? 'bg-[#4299e1] text-white' // Apple blue for hours
                        : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93] dark:text-[#8E8E93]'
                    }`}
                  >
                    {dayHours} hours
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <DailyView 
          selectedDate={currentDate}
          timeLogs={timeLogs}
          onAddEntry={handleAddEntry}
          onEditEntry={handleEditEntry}
          onDeleteEntry={onDeleteTimeLog}
        />
      )}
      
      {/* Time Entry Dialog */}
      <TimeEntryDialog 
        isOpen={isEntryDialogOpen}
        onClose={() => setIsEntryDialogOpen(false)}
        onSave={handleSaveEntry}
        initialEntry={currentEntry}
        selectedDate={currentDate}
      />
    </div>
  );
};

export default WeeklyCalendarView;
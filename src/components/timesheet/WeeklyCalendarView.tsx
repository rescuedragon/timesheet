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
      <div className="flex mb-4">
        <div className="flex justify-start">
          <div className="inline-flex bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl shadow-sm p-1.5 relative" 
               style={{ 
                 boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 border: '1px solid rgba(0, 0, 0, 0.04)'
               }}>
            <button 
              onClick={() => {
                setViewMode('weekly');
                if (onViewModeChange) onViewModeChange('weekly');
              }}
              className={`py-2.5 px-5 flex items-center justify-center text-sm font-semibold transition-all duration-300 rounded-xl relative z-10 ${
                viewMode === 'weekly' 
                  ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white' 
                  : 'bg-transparent text-[#8E8E93] dark:text-[#8E8E93] hover:text-[#636366] hover:bg-white/40'
              }`}
              style={{
                boxShadow: viewMode === 'weekly' ? '0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
                transform: viewMode === 'weekly' ? 'translateY(-0.5px)' : 'none',
                letterSpacing: '-0.01em'
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'weekly') {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'weekly') {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              className={`py-2.5 px-5 flex items-center justify-center text-sm font-semibold transition-all duration-300 rounded-xl relative z-10 ${
                viewMode === 'daily' 
                  ? 'bg-white dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white' 
                  : 'bg-transparent text-[#8E8E93] dark:text-[#8E8E93] hover:text-[#636366] hover:bg-white/40'
              }`}
              style={{
                boxShadow: viewMode === 'daily' ? '0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
                transform: viewMode === 'daily' ? 'translateY(-0.5px)' : 'none',
                letterSpacing: '-0.01em'
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'daily') {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'daily') {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          {/* Week Header - Apple Style Card */}
          <div className="flex items-center justify-between mb-4 text-white rounded-2xl p-4 relative overflow-hidden group" 
               style={{ 
                 background: 'linear-gradient(135deg, #0A84FF 0%, #0056CC 100%)',
                 boxShadow: '0 8px 32px rgba(10, 132, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 border: '1px solid rgba(255, 255, 255, 0.1)'
               }}>
            {/* Subtle animated background pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)'
              }}
            />
            
            {/* Matte Black Container for Date and Hours */}
            <div className="relative z-10">
              <div 
                className="inline-block px-6 py-4 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <h2 className="text-lg font-semibold tracking-tight mb-1 text-white drop-shadow-sm" style={{ letterSpacing: '-0.02em' }}>
                  {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')} - 
                  {format(endOfWeek(currentDate, { weekStartsOn: 1 }), ' MMM d, yyyy')}
                </h2>
                <p className="text-sm text-white/90 font-medium">{getWeekTotal()} hours this week</p>
              </div>
            </div>
            <div className="flex gap-2 relative z-10">
              <button 
                onClick={goToPreviousWeek}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 transition-all duration-200 transform hover:scale-105 active:scale-95"
                aria-label="Previous week"
                style={{ 
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button 
                onClick={goToCurrentWeek}
                className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 transition-all duration-200 text-sm font-semibold transform hover:scale-105 active:scale-95"
                style={{ 
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                This Week
              </button>
              <button 
                onClick={goToNextWeek}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 transition-all duration-200 transform hover:scale-105 active:scale-95"
                aria-label="Next week"
                style={{ 
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Days Grid - Apple Style Cards */}
          <div className="grid grid-cols-5 gap-3 flex-1">
            {weekDays.map((day, index) => {
              const dayHours = getHoursForDay(day);
              const isToday = isSameDay(day, new Date());
              const hasHours = parseFloat(dayHours) > 0;
              
              return (
                <div 
                  key={index}
                  className={`group flex flex-col items-center p-4 rounded-2xl cursor-pointer relative overflow-hidden ${
                    isToday 
                      ? 'bg-white dark:bg-[#1C1C1E]' 
                      : 'bg-white dark:bg-[#1C1C1E]'
                  }`}
                  onClick={() => handleDaySelect(day)}
                  style={{
                    background: isToday 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)' 
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: isToday 
                      ? '1px solid rgba(10, 132, 255, 0.2)' 
                      : '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: isToday 
                      ? '0 4px 20px rgba(10, 132, 255, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)' 
                      : '0 1px 3px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    transform: 'translateZ(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = isToday 
                      ? '0 8px 32px rgba(10, 132, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.08)' 
                      : '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.borderColor = isToday 
                      ? 'rgba(10, 132, 255, 0.3)' 
                      : 'rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = isToday 
                      ? '0 4px 20px rgba(10, 132, 255, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)' 
                      : '0 1px 3px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.borderColor = isToday 
                      ? 'rgba(10, 132, 255, 0.2)' 
                      : 'rgba(0, 0, 0, 0.06)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  }}
                >
                  {/* Subtle gradient overlay for depth */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: isToday 
                        ? 'linear-gradient(135deg, rgba(10, 132, 255, 0.03) 0%, rgba(10, 132, 255, 0.01) 100%)' 
                        : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.01) 100%)'
                    }}
                  />
                  
                  <span className="text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93] relative z-10 transition-colors duration-200 group-hover:text-[#636366]">
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-3xl font-semibold my-2 relative z-10 transition-all duration-200 ${
                    isToday 
                      ? 'text-[#0A84FF] group-hover:text-[#0056CC]' 
                      : 'text-[#1D1D1F] dark:text-white group-hover:text-[#0A84FF]'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  <span className="text-xs text-[#8E8E93] dark:text-[#8E8E93] mb-1 relative z-10 transition-colors duration-200 group-hover:text-[#636366]">
                    {format(day, 'MMM yyyy')}
                  </span>
                  <div 
                    className={`mt-3 w-full py-2.5 px-3 rounded-xl text-center font-medium text-sm relative z-10 transition-all duration-300 ${
                      hasHours
                        ? 'bg-[#0A84FF] text-white shadow-sm group-hover:bg-[#0056CC] group-hover:shadow-md' 
                        : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93] dark:text-[#8E8E93] group-hover:bg-[#E5E5EA] group-hover:text-[#636366]'
                    }`}
                    style={{
                      backdropFilter: hasHours ? 'none' : 'blur(8px)',
                      WebkitBackdropFilter: hasHours ? 'none' : 'blur(8px)'
                    }}
                  >
                    {dayHours} hours
                  </div>
                  
                  {/* Subtle shine effect on hover */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)'
                    }}
                  />
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
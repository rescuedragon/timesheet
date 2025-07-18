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
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  selectedDate = new Date(),
  onDateChange,
  timeLogs = [],
  onAddTimeLog,
  onUpdateTimeLog,
  onDeleteTimeLog
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeLog | undefined>(undefined);
  
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
    setIsEntryDialogOpen(false);
  };
  
  return (
    <div className="w-full">
      {/* View Toggle - Apple Style Segmented Control */}
      <div className="flex mb-6">
        <div className="w-full flex justify-center">
          <div className="inline-flex rounded-xl bg-[#F2F2F7] dark:bg-[#1C1C1E] p-1 shadow-inner">
            <button 
              onClick={() => setViewMode('weekly')}
              className={`py-2 px-6 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                viewMode === 'weekly' ? '' : 'bg-transparent'
              }`}
              style={viewMode === 'weekly' ? {
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05), 0px 0px 0px 1px rgba(0, 0, 0, 0.05), 0px 2px 5px rgba(0, 0, 0, 0.03)'
              } : {}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className={viewMode === 'weekly' ? "text-[#000000] dark:text-[#000000]" : "text-[#8E8E93] dark:text-[#8E8E93]"}>
                Weekly View
              </span>
            </button>
            <button 
              onClick={() => setViewMode('daily')}
              className={`py-2 px-6 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                viewMode === 'daily' ? '' : 'bg-transparent'
              }`}
              style={viewMode === 'daily' ? {
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
                boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.05), 0px 0px 0px 1px rgba(0, 0, 0, 0.05), 0px 2px 5px rgba(0, 0, 0, 0.03)'
              } : {}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <line x1="3" y1="16" x2="21" y2="16"></line>
              </svg>
              <span className={viewMode === 'daily' ? "text-[#000000] dark:text-[#000000]" : "text-[#8E8E93] dark:text-[#8E8E93]"}>
                Daily View
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {viewMode === 'weekly' ? (
        <>
          {/* Week Header - Apple Style Card */}
          <div className="flex items-center justify-between mb-6 bg-[#1C1C1E] dark:bg-[#1C1C1E] text-white rounded-xl p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold">
                {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')} - 
                {format(endOfWeek(currentDate, { weekStartsOn: 1 }), ' MMM d, yyyy')}
              </h2>
              <p className="text-sm text-[#A0A0A8]">{getWeekTotal()} hours this week</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={goToPreviousWeek}
                className="p-2 rounded-lg bg-[#2C2C2E] hover:bg-[#3A3A3C] transition-colors"
                aria-label="Previous week"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button 
                onClick={goToCurrentWeek}
                className="px-4 py-2 rounded-lg bg-[#0A84FF] hover:bg-[#007AFF] transition-colors text-sm font-medium"
              >
                This Week
              </button>
              <button 
                onClick={goToNextWeek}
                className="p-2 rounded-lg bg-[#2C2C2E] hover:bg-[#3A3A3C] transition-colors"
                aria-label="Next week"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Days Grid - Apple Style Cards */}
          <div className="grid grid-cols-5 gap-4">
            {weekDays.map((day, index) => {
              const dayHours = getHoursForDay(day);
              const isToday = isSameDay(day, new Date());
              const hasHours = parseFloat(dayHours) > 0;
              
              return (
                <div 
                  key={index}
                  className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isToday 
                      ? 'bg-[#F2F2F7] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A]' 
                      : 'bg-white dark:bg-[#1C1C1E] border-[#E5E5EA] dark:border-[#2C2C2E]'
                  } hover:shadow-md`}
                  onClick={() => handleDaySelect(day)}
                  style={{
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <span className="text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">
                    {format(day, 'EEE')}
                  </span>
                  <span className="text-4xl font-bold my-1 text-[#000000] dark:text-white">
                    {format(day, 'd')}
                  </span>
                  <span className="text-xs text-[#8E8E93] dark:text-[#8E8E93]">
                    {format(day, 'MMM yyyy')}
                  </span>
                  <div 
                    className={`mt-4 w-full py-2 px-4 rounded-lg text-center font-medium ${
                      hasHours
                        ? 'bg-[#1C1C1E] dark:bg-[#2C2C2E] text-white' 
                        : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93] dark:text-[#8E8E93]'
                    }`}
                    style={{
                      boxShadow: hasHours ? '0px 1px 2px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
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
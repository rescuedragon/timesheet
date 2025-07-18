import React, { useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { TimeLog } from '@/types';

interface DailyViewProps {
  selectedDate: Date;
  timeLogs: TimeLog[];
  onAddEntry?: () => void;
  onEditEntry?: (entry: TimeLog) => void;
  onDeleteEntry?: (entry: TimeLog) => void;
}

const DailyView: React.FC<DailyViewProps> = ({
  selectedDate,
  timeLogs,
  onAddEntry,
  onEditEntry,
  onDeleteEntry
}) => {
  // Filter logs for the selected date
  const dailyLogs = timeLogs.filter(log => 
    isSameDay(parseISO(log.date), selectedDate)
  );
  
  // Calculate total hours for the day
  const totalHours = dailyLogs.reduce((total, log) => total + log.duration, 0) / 3600;
  
  // Group logs by date for display
  const groupedLogs: Record<string, TimeLog[]> = {};
  
  dailyLogs.forEach(log => {
    const dateKey = log.date;
    if (!groupedLogs[dateKey]) {
      groupedLogs[dateKey] = [];
    }
    groupedLogs[dateKey].push(log);
  });
  
  // Format time (seconds to HH:MM)
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="w-full">
      {/* Header with date and add entry button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#000000] dark:text-white">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        <button 
          onClick={onAddEntry}
          className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[#0A84FF] hover:bg-[#007AFF] text-white transition-colors text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add entry
        </button>
      </div>
      
      {/* Time entries table */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-xl border border-[#E5E5EA] dark:border-[#38383A] overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 bg-[#F2F2F7] dark:bg-[#2C2C2E] px-4 py-3 border-b border-[#E5E5EA] dark:border-[#38383A]">
          <div className="col-span-2 text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">PROJECT</div>
          <div className="col-span-2 text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">SUBPROJECT</div>
          <div className="col-span-2 text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">START</div>
          <div className="col-span-2 text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">END</div>
          <div className="col-span-2 text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">DURATION (HRS)</div>
          <div className="col-span-1 text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">DESCRIPTION</div>
          <div className="col-span-1 text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">ACTIONS</div>
        </div>
        
        {/* Table body */}
        {dailyLogs.length > 0 ? (
          dailyLogs.map((log, index) => (
            <div 
              key={index} 
              className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-[#E5E5EA] dark:border-[#38383A] hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] transition-colors"
            >
              <div className="col-span-2 text-sm text-[#000000] dark:text-white">{log.project || '-'}</div>
              <div className="col-span-2 text-sm text-[#000000] dark:text-white">{log.subproject || '-'}</div>
              <div className="col-span-2 text-sm text-[#000000] dark:text-white">{log.startTime ? formatTime(log.startTime) : '-'}</div>
              <div className="col-span-2 text-sm text-[#000000] dark:text-white">{log.endTime ? formatTime(log.endTime) : '-'}</div>
              <div className="col-span-2 text-sm font-medium text-[#000000] dark:text-white">
                {(log.duration / 3600).toFixed(1)}
              </div>
              <div className="col-span-1 text-sm text-[#000000] dark:text-white">{log.description || '-'}</div>
              <div className="col-span-1 flex gap-2">
                <button 
                  onClick={() => onEditEntry && onEditEntry(log)}
                  className="p-1 text-[#8E8E93] hover:text-[#0A84FF] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button 
                  onClick={() => onDeleteEntry && onDeleteEntry(log)}
                  className="p-1 text-[#8E8E93] hover:text-[#FF3B30] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-[#8E8E93] dark:text-[#8E8E93]">No time entries for this day</p>
            <button 
              onClick={onAddEntry}
              className="mt-4 py-2 px-4 rounded-lg bg-[#0A84FF] hover:bg-[#007AFF] text-white transition-colors text-sm font-medium"
            >
              Add your first entry
            </button>
          </div>
        )}
        
        {/* Daily total */}
        <div className="flex justify-end px-4 py-3 bg-[#F2F2F7] dark:bg-[#2C2C2E]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">Daily Total</span>
            <span className="text-lg font-bold text-[#000000] dark:text-white">{totalHours.toFixed(1)} hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyView;
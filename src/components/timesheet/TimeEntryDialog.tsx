import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { TimeLog } from '@/types';

interface TimeEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: TimeLog) => void;
  initialEntry?: TimeLog;
  selectedDate: Date;
}

const TimeEntryDialog: React.FC<TimeEntryDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry,
  selectedDate
}) => {
  const [entry, setEntry] = useState<Partial<TimeLog>>({
    projectId: '',
    subprojectId: '',
    projectName: '',
    subprojectName: '',
    startTime: '',
    endTime: '',
    duration: 0,
    description: '',
    date: format(selectedDate, 'yyyy-MM-dd')
  });
  
  // Initialize form with initial entry data if provided
  useEffect(() => {
    if (initialEntry) {
      setEntry({
        ...initialEntry
      });
    } else {
      setEntry({
        projectId: '',
        subprojectId: '',
        projectName: '',
        subprojectName: '',
        startTime: '',
        endTime: '',
        duration: 0,
        description: '',
        date: format(selectedDate, 'yyyy-MM-dd')
      });
    }
  }, [initialEntry, selectedDate]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle time input changes
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setEntry(prev => {
      const newEntry = { ...prev, [name]: value };
      
      // Calculate duration if both start and end times are set
      if ((name === 'startTime' && prev.endTime) || (name === 'endTime' && prev.startTime)) {
        const startParts = (name === 'startTime' ? value : prev.startTime).split(':').map(Number);
        const endParts = (name === 'endTime' ? value : prev.endTime).split(':').map(Number);
        
        const startSeconds = (startParts[0] * 3600) + (startParts[1] * 60);
        const endSeconds = (endParts[0] * 3600) + (endParts[1] * 60);
        
        if (endSeconds >= startSeconds) {
          newEntry.duration = endSeconds - startSeconds;
        }
      }
      
      return newEntry;
    });
  };
  
  // Format duration in seconds to hours and minutes
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h${minutes.toString().padStart(2, '0')}m`;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the date in yyyy-MM-dd format
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    // Generate a complete TimeLog object
    const completeEntry: TimeLog = {
      id: initialEntry?.id || `log_${Date.now()}`,
      projectId: entry.projectId || `project_${Date.now()}`,
      subprojectId: entry.subprojectId || `subproject_${Date.now()}`,
      projectName: entry.projectName || 'Default Project',
      subprojectName: entry.subprojectName || 'Default Subproject',
      startTime: entry.startTime || '09:00',
      endTime: entry.endTime || '17:00',
      duration: entry.duration || 28800, // Default to 8 hours (28800 seconds)
      description: entry.description || '',
      date: formattedDate
    };
    
    console.log('Saving time entry:', completeEntry);
    onSave(completeEntry);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1C1C1E] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-[#E5E5EA] dark:border-[#38383A]">
          <h2 className="text-2xl font-semibold text-[#000000] dark:text-white">Time Entry</h2>
          <div className="text-sm text-[#8E8E93] dark:text-[#8E8E93]">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Duration display */}
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-32 h-32 rounded-full border-4 border-[#E5E5EA] dark:border-[#38383A] flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#000000] dark:text-white">
                  {formatDuration(entry.duration || 0)}
                </div>
                <div className="text-sm text-[#8E8E93] dark:text-[#8E8E93]">click to edit</div>
              </div>
            </div>
          </div>
          
          {/* Time inputs */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#34C759] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">START TIME</div>
                  <input
                    type="time"
                    name="startTime"
                    value={entry.startTime || ''}
                    onChange={handleTimeChange}
                    className="bg-transparent text-xl font-bold text-[#000000] dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#FF3B30] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">END TIME</div>
                  <input
                    type="time"
                    name="endTime"
                    value={entry.endTime || ''}
                    onChange={handleTimeChange}
                    className="bg-transparent text-xl font-bold text-[#000000] dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Project info */}
          <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#5856D6] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">PROJECT</div>
                <input
                  type="text"
                  name="projectName"
                  value={entry.projectName || ''}
                  onChange={handleChange}
                  placeholder="Marketing Campaign"
                  className="w-full bg-transparent text-xl font-bold text-[#000000] dark:text-white focus:outline-none"
                />
                <input type="hidden" name="projectId" value={entry.projectId || ''} />
              </div>
            </div>
            <div className="ml-12 mt-2">
              <div className="text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">SUBPROJECT</div>
              <input
                type="text"
                name="subprojectName"
                value={entry.subprojectName || ''}
                onChange={handleChange}
                placeholder="Subproject 6"
                className="w-full bg-transparent text-lg text-[#000000] dark:text-white focus:outline-none"
              />
              <input type="hidden" name="subprojectId" value={entry.subprojectId || ''} />
            </div>
          </div>
          
          {/* Description */}
          <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="21" y1="10" x2="3" y2="10"></line>
                  <line x1="21" y1="6" x2="3" y2="6"></line>
                  <line x1="21" y1="14" x2="3" y2="14"></line>
                  <line x1="21" y1="18" x2="3" y2="18"></line>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#8E8E93] dark:text-[#8E8E93]">DESCRIPTION</div>
                <textarea
                  name="description"
                  value={entry.description || ''}
                  onChange={handleChange}
                  placeholder="What did you work on? Add any notes or details..."
                  rows={4}
                  className="w-full bg-transparent text-lg text-[#000000] dark:text-white focus:outline-none resize-none mt-2"
                />
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-[#E5E5EA] dark:border-[#38383A]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg border border-[#E5E5EA] dark:border-[#38383A] text-[#8E8E93] dark:text-[#8E8E93] hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-[#0A84FF] hover:bg-[#007AFF] text-white transition-colors font-medium"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeEntryDialog;
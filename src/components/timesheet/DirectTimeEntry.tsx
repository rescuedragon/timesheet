import React from 'react';
import { format } from 'date-fns';
import { TimeLog } from '@/types';

interface DirectTimeEntryProps {
  onAddTimeLog: (log: TimeLog) => void;
}

const DirectTimeEntry: React.FC<DirectTimeEntryProps> = ({ onAddTimeLog }) => {
  const createEntry = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const newEntry: TimeLog = {
      id: `entry_${Date.now()}`,
      projectId: 'project_123',
      subprojectId: 'subproject_456',
      projectName: 'Marketing Campaign',
      subprojectName: 'Subproject 6',
      startTime: '09:00',
      endTime: '17:00',
      duration: 28800, // 8 hours in seconds
      description: 'Created sample marketing materials',
      date: today
    };
    
    onAddTimeLog(newEntry);
  };
  
  return (
    <button
      onClick={createEntry}
      className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[#0A84FF] hover:bg-[#007AFF] text-white transition-colors text-sm font-medium"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      Add entry
    </button>
  );
};

export default DirectTimeEntry;
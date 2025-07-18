import React from 'react';
import { storageService } from '@/services/storageService';
import { TimeLog } from '@/types';
import { format } from 'date-fns';

const TestTimeEntry: React.FC = () => {
  // Function to create a test time entry
  const createTestEntry = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const testEntry: TimeLog = {
      id: `test_${Date.now()}`,
      projectId: 'test_project',
      subprojectId: 'test_subproject',
      projectName: 'Test Project',
      subprojectName: 'Test Subproject',
      startTime: '09:00',
      endTime: '17:00',
      duration: 28800, // 8 hours in seconds
      description: 'This is a test entry',
      date: today
    };
    
    // Get current logs
    const currentLogs = storageService.getTimeLogs();
    
    // Add new test entry
    const updatedLogs = [...currentLogs, testEntry];
    
    // Save updated logs
    storageService.saveTimeLogs(updatedLogs);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('time-logs-updated'));
    
    console.log('Test entry created:', testEntry);
    console.log('All time logs:', updatedLogs);
  };
  
  // Function to clear all time entries
  const clearAllEntries = () => {
    storageService.saveTimeLogs([]);
    window.dispatchEvent(new CustomEvent('time-logs-updated'));
    console.log('All time logs cleared');
  };
  
  // Function to view all time entries
  const viewAllEntries = () => {
    const logs = storageService.getTimeLogs();
    console.log('All time logs:', logs);
  };
  
  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={createTestEntry}
        className="px-4 py-2 bg-green-500 text-white rounded-lg"
      >
        Create Test Entry
      </button>
      
      <button
        onClick={clearAllEntries}
        className="px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Clear All Entries
      </button>
      
      <button
        onClick={viewAllEntries}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        View All Entries
      </button>
    </div>
  );
};

export default TestTimeEntry;
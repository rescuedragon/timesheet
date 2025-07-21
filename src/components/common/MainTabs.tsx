import React from 'react';
import { Calendar } from 'lucide-react';
import TimeTracker from '../TimeTracker';
import TimesheetView from '../TimesheetView';
import Holidays from '../Holidays';

interface MainTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  timeLogs: any[];
  addTimeLog: (newLog: any) => void;
  setTimeLogs?: React.Dispatch<any>;
  replaceTimeLogs: (logs: any[]) => void;
}

const MainTabs: React.FC<MainTabsProps> = ({ activeTab, onTabChange, timeLogs, addTimeLog, replaceTimeLogs }) => {
  return (
    <div className="w-[95%] mx-auto animate-slide-up mt-12">
      <div className="relative w-full mb-4 h-16 rounded-2xl bg-white/95 dark:bg-gray-900/95 p-1 shadow-xl backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30">
        <div className="flex h-full gap-1">
          <div className="flex-1">
            <button
              onClick={() => onTabChange('tracker')}
              className={`w-full h-full rounded-xl font-semibold text-base transition-all duration-300 ease-out ${
                activeTab === 'tracker'
                  ? 'text-white shadow-lg'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              style={{
                isolation: 'isolate',
                contain: 'layout style paint',
                background: activeTab === 'tracker' ? 'linear-gradient(135deg, #7E2EFF 0%, #6366f1 100%)' : 'transparent',
                boxShadow: activeTab === 'tracker' ? '0 4px 16px rgba(126, 46, 255, 0.3), 0 2px 8px rgba(99, 102, 241, 0.2)' : 'none'
              }}
            >
              Time Tracker
            </button>
          </div>
          <div className="flex-1">
            <button
              onClick={() => onTabChange('data')}
              className={`w-full h-full rounded-xl font-semibold text-base transition-all duration-300 ease-out ${
                activeTab === 'data'
                  ? 'text-white shadow-lg'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              style={{
                isolation: 'isolate',
                contain: 'layout style paint',
                background: activeTab === 'data' ? 'linear-gradient(135deg, #4299e1 0%, #3182ce 50%, #2c5282 100%)' : 'transparent',
                boxShadow: activeTab === 'data' ? '0 4px 16px rgba(66, 153, 225, 0.3), 0 2px 8px rgba(49, 130, 206, 0.2)' : 'none'
              }}
            >
              Timesheet
            </button>
          </div>
          <div className="flex-1">
            <button
              onClick={() => onTabChange('holidays')}
              className={`w-full h-full rounded-xl font-semibold text-base transition-all duration-300 ease-out flex items-center justify-center gap-2 ${
                activeTab === 'holidays'
                  ? 'text-white shadow-lg'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              style={{
                isolation: 'isolate',
                contain: 'layout style paint',
                background: activeTab === 'holidays' ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #0f766e 100%)' : 'transparent',
                boxShadow: activeTab === 'holidays' ? '0 4px 16px rgba(13, 148, 136, 0.3), 0 2px 8px rgba(20, 184, 166, 0.2)' : 'none'
              }}
            >
              <Calendar className="h-4 w-4" />
              Holidays
            </button>
          </div>
        </div>
      </div>
      
      <div className="animate-fade-in transition-all duration-200 ease-out">
        {activeTab === 'tracker' && <TimeTracker onAddTimeLog={addTimeLog} />}
        {activeTab === 'data' && <TimesheetView />}
        {activeTab === 'holidays' && <Holidays />}
      </div>
    </div>
  );
};

export default MainTabs; 
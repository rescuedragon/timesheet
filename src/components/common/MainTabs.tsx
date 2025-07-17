import React from 'react';
import { Calendar } from 'lucide-react';
import TimeTracker from '../TimeTracker';
import ExcelView from '../ExcelView';
import Holidays from '../Holidays';

interface MainTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  timeLogs: any[];
  addTimeLog: (newLog: any) => void;
  setTimeLogs: React.Dispatch<any>;
  replaceTimeLogs: (logs: any[]) => void;
}

const MainTabs: React.FC<MainTabsProps> = ({ activeTab, onTabChange, timeLogs, addTimeLog, setTimeLogs, replaceTimeLogs }) => {
  return (
    <div className="w-[95%] mx-auto animate-slide-up mt-12">
      <div className="relative w-full mb-4 h-16 rounded-2xl bg-white/80 p-3 shadow-lg backdrop-blur-sm border border-gray-200/50">
        <div className="flex h-full gap-3">
          <div className="flex-1">
            <button
              onClick={() => onTabChange('tracker')}
              className={`w-full h-full rounded-xl font-medium text-base transition-all duration-300 ease-out ${
                activeTab === 'tracker'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-transparent text-gray-700 hover:bg-gray-50'
              }`}
              style={{
                isolation: 'isolate',
                contain: 'layout style paint'
              }}
            >
              Time Tracker
            </button>
          </div>
          <div className="flex-1">
            <button
              onClick={() => onTabChange('data')}
              className={`w-full h-full rounded-xl font-medium text-base transition-all duration-300 ease-out ${
                activeTab === 'data'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-transparent text-gray-700 hover:bg-gray-50'
              }`}
              style={{
                isolation: 'isolate',
                contain: 'layout style paint'
              }}
            >
              Timesheet
            </button>
          </div>
          <div className="flex-1">
            <button
              onClick={() => onTabChange('holidays')}
              className={`w-full h-full rounded-xl font-medium text-base transition-all duration-300 ease-out flex items-center justify-center gap-2 ${
                activeTab === 'holidays'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-transparent text-gray-700 hover:bg-gray-50'
              }`}
              style={{
                isolation: 'isolate',
                contain: 'layout style paint'
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
        {activeTab === 'data' && <ExcelView timeLogs={timeLogs} addTimeLog={addTimeLog} setTimeLogs={setTimeLogs} replaceTimeLogs={replaceTimeLogs} />}
        {activeTab === 'holidays' && <Holidays />}
      </div>
    </div>
  );
};

export default MainTabs; 
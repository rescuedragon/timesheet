import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-[95%] mx-auto animate-slide-up">
      <TabsList className="grid w-full grid-cols-3 mb-4 h-16 rounded-2xl bg-muted/30 p-2 shadow-2xl backdrop-blur-xl border border-border/20">
        <TabsTrigger 
          value="tracker" 
          className="rounded-2xl font-medium text-base h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:opacity-90 hover:shadow-lg"
        >
          Time Tracker
        </TabsTrigger>
        <TabsTrigger 
          value="data" 
          className="rounded-2xl font-medium text-base h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:opacity-90 hover:shadow-lg"
        >
          Timesheet
        </TabsTrigger>
        <TabsTrigger 
          value="holidays" 
          className="rounded-2xl font-medium text-base h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:opacity-90 hover:shadow-lg flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Holidays
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="tracker" className="animate-fade-in transition-all duration-200 ease-out">
        <TimeTracker onAddTimeLog={addTimeLog} />
      </TabsContent>
      
      <TabsContent value="data" className="animate-fade-in transition-all duration-200 ease-out">
        <ExcelView timeLogs={timeLogs} addTimeLog={addTimeLog} setTimeLogs={setTimeLogs} replaceTimeLogs={replaceTimeLogs} />
      </TabsContent>
      
      <TabsContent value="holidays" className="animate-fade-in transition-all duration-200 ease-out">
        <Holidays />
      </TabsContent>
    </Tabs>
  );
};

export default MainTabs; 
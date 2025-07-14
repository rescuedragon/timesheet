import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon } from 'lucide-react';
import SettingsProjects from './settings/SettingsProjects';
import SettingsHolidays from './settings/SettingsHolidays';
import SettingsUserAccess from './settings/SettingsUserAccess';
import SettingsManagerAccess from './settings/SettingsManagerAccess';
import { useSettings } from '@/hooks/useSettings';
import { useState } from 'react';

const Settings: React.FC = () => {
  const {
    progressBarEnabled,
    progressBarColor,
    colorCodedProjectsEnabled,
    frequentSubprojectsEnabled,
    projects,
    setProjects,
    holidays,
    setHolidays,
    handleProgressBarToggle,
    handleProgressBarColorChange,
    handleColorCodedProjectsToggle,
    handleFrequentSubprojectsToggle
  } = useSettings();

  // Local state for pending changes
  const [pendingProgressBarEnabled, setPendingProgressBarEnabled] = useState(progressBarEnabled);
  const [pendingProgressBarColor, setPendingProgressBarColor] = useState(progressBarColor);
  const [pendingColorCodedProjectsEnabled, setPendingColorCodedProjectsEnabled] = useState(colorCodedProjectsEnabled);
  const [pendingFrequentSubprojectsEnabled, setPendingFrequentSubprojectsEnabled] = useState(frequentSubprojectsEnabled);
  const [pendingProjects, setPendingProjects] = useState(projects);
  const [pendingHolidays, setPendingHolidays] = useState(holidays);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Save handler
  const handleSave = () => {
    handleProgressBarToggle(pendingProgressBarEnabled);
    handleProgressBarColorChange(pendingProgressBarColor);
    handleColorCodedProjectsToggle(pendingColorCodedProjectsEnabled);
    handleFrequentSubprojectsToggle(pendingFrequentSubprojectsEnabled);
    setProjects(pendingProjects);
    setHolidays(pendingHolidays);
    window.dispatchEvent(new CustomEvent('settings-changed'));
    setDialogOpen(false); // Close dialog after saving
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-4 rounded-2xl shadow-2xl hover:shadow-2xl bg-card/90 backdrop-blur-xl border border-border/30 hover:border-border/50 transition-all duration-300">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="holidays">Holidays</TabsTrigger>
            <TabsTrigger value="user">User Access</TabsTrigger>
            <TabsTrigger value="manager">Manager Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-4">
            <SettingsProjects projects={pendingProjects} setProjects={setPendingProjects} />
          </TabsContent>

          <TabsContent value="holidays" className="space-y-4">
            <SettingsHolidays holidays={pendingHolidays} setHolidays={setPendingHolidays} />
          </TabsContent>
          
          <TabsContent value="user" className="space-y-4">
            <SettingsUserAccess
              progressBarEnabled={pendingProgressBarEnabled}
              progressBarColor={pendingProgressBarColor}
              colorCodedProjectsEnabled={pendingColorCodedProjectsEnabled}
              frequentSubprojectsEnabled={pendingFrequentSubprojectsEnabled}
              onProgressBarToggle={setPendingProgressBarEnabled}
              onProgressBarColorChange={setPendingProgressBarColor}
              onColorCodedProjectsToggle={setPendingColorCodedProjectsEnabled}
              onFrequentSubprojectsToggle={setPendingFrequentSubprojectsEnabled}
            />
          </TabsContent>
          
          <TabsContent value="manager" className="space-y-4">
            <SettingsManagerAccess holidays={pendingHolidays} setHolidays={setPendingHolidays} />
          </TabsContent>
        </Tabs>
        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} className="px-8 py-3 text-base font-semibold rounded-xl shadow-lg bg-black text-white hover:bg-gray-900 transition-all duration-200">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
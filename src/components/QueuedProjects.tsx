import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Play, Square, Save } from 'lucide-react';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';

export interface QueuedProject {
  id: string;
  projectId: string;
  subprojectId: string;
  projectName: string;
  subprojectName: string;
  elapsedTime: number;
  startTime: Date;
}

interface QueuedProjectsProps {
  queuedProjects: QueuedProject[];
  onResumeProject: (queuedProject: QueuedProject) => void;
  onStopProject: (queuedProjectId: string) => void;
  onLogTime?: (duration: number, description: string, startTime: Date, endTime: Date, projectId: string, subprojectId: string) => void;
}

const QueuedProjects: React.FC<QueuedProjectsProps> = ({
  queuedProjects,
  onResumeProject,
  onStopProject,
  onLogTime
}) => {
  const [stoppingProject, setStoppingProject] = useState<QueuedProject | null>(null);
  const [description, setDescription] = useState('');
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);

  useEffect(() => {
    setColorCodedEnabled(isColorCodedProjectsEnabled());
    
    const handleStorageChange = () => {
      setColorCodedEnabled(isColorCodedProjectsEnabled());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleStorageChange);
    };
  }, []);

  const getProjectBackgroundStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    return {
      backgroundColor: generateProjectColor(projectName)
    };
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRoundoffTime = (seconds: number) => {
    return (seconds / 3600).toFixed(2);
  };

  const handleStopClick = (project: QueuedProject) => {
    setStoppingProject(project);
  };

  const handleConfirmStop = () => {
    if (stoppingProject && onLogTime) {
      const endTime = new Date();
      onLogTime(
        stoppingProject.elapsedTime,
        description,
        stoppingProject.startTime,
        endTime,
        stoppingProject.projectId,
        stoppingProject.subprojectId
      );
      onStopProject(stoppingProject.id);
    } else {
      if (stoppingProject) {
        onStopProject(stoppingProject.id);
      }
    }
    setStoppingProject(null);
    setDescription('');
  };

  const handleCancelStop = () => {
    setStoppingProject(null);
    setDescription('');
  };

  if (queuedProjects.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white/10 dark:bg-gray-850 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full backdrop-blur-md">
        {/* Paused Projects header */}
        <div className="relative text-xl font-bold px-2.5 py-3 rounded-t-xl flex items-center justify-center text-center" style={{ minHeight: '2.1rem', fontSize: '1.02rem', letterSpacing: '-0.01em', background: 'rgba(150, 150, 160, 0.18)' }}>
          <span className="relative z-10">Paused Projects</span>
          {/* Glassmorphism overlay */}
          <span className="absolute inset-0 rounded-t-xl bg-white/10 backdrop-blur-md border-b border-white/20 pointer-events-none z-0" />
        </div>
        <div className="w-full p-4">
          <div className="w-full space-y-4">
            {queuedProjects.map(project => (
              <div 
                key={project.id} 
                className="flex items-stretch w-full bg-transparent border-none rounded-none shadow-none overflow-visible"
                style={{...getProjectBackgroundStyle(project.projectName), background: 'transparent', border: 'none', borderRadius: 0, boxShadow: 'none'}}>
                {/* Project name container (left 15%) */}
                <div className="w-[15%] min-w-[100px] bg-gray-900 dark:bg-gray-900 flex flex-col items-center justify-center text-white p-3">
                  <div className="font-bold text-center text-sm">
                    {project.projectName}
                  </div>
                  {project.subprojectName && (
                    <div className="text-xs text-center text-gray-300 mt-1">
                      {project.subprojectName}
                    </div>
                  )}
                </div>
                
                {/* Main content area */}
                <div className="flex-1 flex flex-col md:flex-row items-center justify-between w-full p-4">
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-750 px-3 py-2 rounded-lg mb-2">
                      Paused at: {formatTime(project.elapsedTime)}
                    </div>
                    
                    {/* Round-off time circle */}
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-900 dark:bg-gray-900 text-white font-bold text-xs rounded-full">
                      {formatRoundoffTime(project.elapsedTime)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onResumeProject(project)}
                      className="bg-black text-white hover:bg-neutral-900 active:bg-neutral-950 border border-neutral-800 px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.18)]"
                    >
                      <Play className="h-3 w-3 mr-1.5" />
                      <span>Resume</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStopClick(project)}
                      className="bg-black text-white hover:bg-neutral-900 active:bg-neutral-950 border border-neutral-800 px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.18)]"
                    >
                      <Square className="h-3 w-3 mr-1.5" />
                      <span>Stop</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stop Confirmation Dialog */}
      <Dialog open={!!stoppingProject} onOpenChange={(open) => !open && handleCancelStop()}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-850 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
          <DialogHeader className="w-full pb-4">
            <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">
              Log Time Entry
            </DialogTitle>
          </DialogHeader>
          {stoppingProject && (
            <div className="w-full space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="font-medium text-sm text-gray-800 dark:text-gray-100 mb-1">
                  {stoppingProject.projectName}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-4">
                  {stoppingProject.subprojectName}
                </div>
                
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-xs font-mono text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-750 px-3 py-2 rounded-lg">
                    Duration: {formatTime(stoppingProject.elapsedTime)}
                  </div>
                  
                  {/* Round-off circle in dialog */}
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-900 dark:bg-gray-900 text-white font-bold text-xs rounded-full">
                    {formatRoundoffTime(stoppingProject.elapsedTime)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                  Description (optional)
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you work on?"
                  rows={3}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 text-sm w-full rounded-lg"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleConfirmStop} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
                >
                  <Save className="h-3 w-3 mr-1.5" />
                  <span>Save & Stop</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelStop}
                  className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg px-4 py-2"
                >
                  <span>Cancel</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QueuedProjects;
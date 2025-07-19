import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Play, Square, Save, AlertCircle } from 'lucide-react';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';
import { motion, Variants, Transition } from 'framer-motion';

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
  isTimerRunning?: boolean;
}

const QueuedProjects: React.FC<QueuedProjectsProps> = ({
  queuedProjects,
  onResumeProject,
  onStopProject,
  onLogTime,
  isTimerRunning = false
}) => {
  const [stoppingProject, setStoppingProject] = useState<QueuedProject | null>(null);
  const [description, setDescription] = useState('');
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);
  const [showTimerError, setShowTimerError] = useState(false);

  useEffect(() => {
    const checkColorCodedStatus = () => {
      const enabled = isColorCodedProjectsEnabled();
      setColorCodedEnabled(enabled);
    };

    checkColorCodedStatus();

    window.addEventListener('storage', checkColorCodedStatus);
    window.addEventListener('settings-changed', checkColorCodedStatus);

    return () => {
      window.removeEventListener('storage', checkColorCodedStatus);
      window.removeEventListener('settings-changed', checkColorCodedStatus);
    };
  }, []);

  const getProjectColorStyle = (projectName: string) => {
    if (!colorCodedEnabled) return {};
    const color = generateProjectColor(projectName);
    return {
      backgroundColor: color,
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
      
      // Create a new log entry directly to ensure it appears in Daily view
      const newLog = {
        id: Date.now().toString(),
        projectId: stoppingProject.projectId,
        subprojectId: stoppingProject.subprojectId,
        projectName: stoppingProject.projectName,
        subprojectName: stoppingProject.subprojectName,
        duration: stoppingProject.elapsedTime,
        description,
        date: new Date().toISOString().split('T')[0],
        startTime: stoppingProject.startTime.toLocaleTimeString(),
        endTime: endTime.toLocaleTimeString()
      };
      
      // Save directly to storage to ensure it's available to other components
      const existingLogs = JSON.parse(localStorage.getItem('timesheet-logs') || '[]');
      const updatedLogs = [newLog, ...existingLogs];
      localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
      
      // Dispatch time-logs-updated event to ensure TimesheetView loads the updated logs
      window.dispatchEvent(new CustomEvent('time-logs-updated'));
      
      // Force switch to the Timesheet tab and daily view
      window.dispatchEvent(new CustomEvent('switchToTimesheetTab'));
      window.dispatchEvent(new CustomEvent('switchToDailyView'));
      
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

  const handleResumeClick = (project: QueuedProject) => {
    if (isTimerRunning) {
      setShowTimerError(true);
      // Auto-hide the error after 3 seconds
      setTimeout(() => setShowTimerError(false), 3000);
      return;
    }
    onResumeProject(project);
  };

  if (queuedProjects.length === 0) {
    return null;
  }

  const transition: Transition = {
    type: 'spring',
    stiffness: 100,
    damping: 15
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      <motion.div
        className="w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative bg-gradient-to-br from-white/95 via-blue-50/30 to-purple-50/30 dark:from-gray-900/95 dark:via-blue-900/10 dark:to-purple-900/10 backdrop-blur-2xl rounded-3xl border border-blue-200/30 dark:border-blue-700/30 shadow-2xl shadow-blue-500/5 dark:shadow-blue-900/20">
          {/* Colorful inner highlight */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5 pointer-events-none"></div>

          <div className="relative p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-full shadow-lg shadow-orange-500/50"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-full animate-pulse opacity-40"></div>
                  <div className="absolute -inset-1 w-6 h-6 bg-gradient-to-br from-orange-400/20 via-pink-500/20 to-purple-600/20 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent tracking-tight">
                  Paused Projects
                </h3>
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold bg-gradient-to-r from-blue-100/90 via-purple-100/90 to-pink-100/90 dark:from-blue-900/90 dark:via-purple-900/90 dark:to-pink-900/90 px-4 py-2 rounded-full shadow-sm border border-blue-300/40 dark:border-blue-600/40 backdrop-blur-sm">
                {queuedProjects.length} {queuedProjects.length === 1 ? 'project' : 'projects'}
              </div>
            </div>

            <motion.div className="space-y-3" variants={containerVariants}>
              {queuedProjects.map(project => (
                <motion.div
                  key={project.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="group relative bg-white/95 dark:bg-gray-800/70 rounded-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-900/20 hover:scale-[1.01] hover:border-purple-300/40 dark:hover:border-purple-600/40"
                >
                  {/* Subtle purple inner glow */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/2 via-transparent to-purple-500/1 dark:from-purple-400/2 dark:to-purple-400/1 pointer-events-none"></div>

                  {/* Project color border */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={getProjectColorStyle(project.projectName)}
                  />

                  <div className="relative p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-center sm:text-left">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 text-base tracking-tight">
                        {project.projectName}
                      </div>
                      {project.subprojectName && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                          {project.subprojectName}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="font-mono text-sm bg-gray-100/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg font-semibold border border-gray-200/50 dark:border-gray-600/50 shadow-sm">
                        {formatTime(project.elapsedTime)}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResumeClick(project)}
                          disabled={isTimerRunning}
                          className={`group/btn bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-600/50 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 text-gray-700 dark:text-gray-200 hover:text-green-700 dark:hover:text-green-300 transition-all duration-200 px-3 py-1.5 rounded-lg font-medium shadow-sm ${
                            isTimerRunning 
                              ? 'opacity-50 cursor-not-allowed hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-gray-200/50 dark:hover:border-gray-600/50 hover:text-gray-700 dark:hover:text-gray-200' 
                              : ''
                          }`}
                        >
                          <Play className="h-4 w-4 mr-1.5 group-hover/btn:scale-110 transition-transform duration-200" />
                          Resume
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStopClick(project)}
                          className="group/btn bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-600/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 text-gray-700 dark:text-gray-200 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 px-3 py-1.5 rounded-lg font-medium shadow-sm"
                        >
                          <Square className="h-4 w-4 mr-1.5 group-hover/btn:scale-110 transition-transform duration-200" />
                          Stop
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Timer Running Error Dialog */}
      <Dialog open={showTimerError} onOpenChange={setShowTimerError}>
        <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <DialogHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Timer is running
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Timer is currently active for another project.<br />
              Please stop or pause the current timer first, then try resuming your paused project.
            </p>
            <Button
              onClick={() => setShowTimerError(false)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg py-2.5 px-6 transition-all duration-200"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stop Confirmation Dialog */}
      <Dialog open={!!stoppingProject} onOpenChange={(open) => !open && handleCancelStop()}>
        <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Log Time Entry
            </DialogTitle>
          </DialogHeader>
          {stoppingProject && (
            <div className="space-y-6">
              <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-xl p-6 text-center border border-gray-200/50 dark:border-gray-700/50">
                <div className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                  {stoppingProject.projectName}
                </div>
                {stoppingProject.subprojectName && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {stoppingProject.subprojectName}
                  </div>
                )}
                <div className="font-mono text-2xl text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg inline-block font-semibold bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50">
                  {formatTime(stoppingProject.elapsedTime)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you work on?"
                  className="w-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-sm resize-none placeholder-gray-500 dark:placeholder-gray-400"
                  rows={4}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleConfirmStop}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg py-2.5 text-sm transition-all duration-200 shadow-sm"
                  style={{ backgroundColor: '#7E2EFF' }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save & Stop
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelStop}
                  className="flex-1 bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg py-2.5 text-sm font-medium transition-all duration-200"
                >
                  Cancel
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
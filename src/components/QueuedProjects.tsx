import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Play, Square, Save } from 'lucide-react';
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
        <div className="relative bg-gradient-to-br from-white/95 via-white/90 to-gray-50/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-800/95 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-2xl shadow-gray-900/10 dark:shadow-black/30">
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-gray-700/20 pointer-events-none"></div>

          <div className="relative p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg shadow-orange-500/40"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-full animate-pulse opacity-30"></div>
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent tracking-tight">
                  Paused Projects
                </h3>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold bg-gradient-to-r from-gray-100/95 to-gray-200/95 dark:from-gray-800/95 dark:to-gray-700/95 px-4 py-2 rounded-full shadow-sm border border-gray-300/30 dark:border-gray-600/30 backdrop-blur-sm">
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
                  className="group relative bg-gradient-to-r from-white/90 via-gray-50/80 to-white/90 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/60 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-900/20 hover:scale-[1.01] hover:border-gray-300/60 dark:hover:border-gray-600/60"
                >
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-transparent dark:from-gray-700/20 pointer-events-none"></div>

                  {/* Project color border */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl shadow-sm"
                    style={getProjectColorStyle(project.projectName)}
                  />

                  <div className="relative p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                      <div className="font-mono text-sm bg-gradient-to-r from-white/95 to-gray-100/95 dark:from-gray-900/95 dark:to-gray-800/95 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl font-semibold border border-gray-300/40 dark:border-gray-600/40 shadow-sm backdrop-blur-sm">
                        {formatTime(project.elapsedTime)}
                      </div>

                      <div className="flex gap-2.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onResumeProject(project)}
                          className="group/btn relative bg-gradient-to-r from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-700/95 border-gray-300/50 dark:border-gray-600/50 hover:from-blue-50/95 hover:to-blue-100/95 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 hover:border-blue-400/60 dark:hover:border-blue-500/60 text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 px-4 py-2 rounded-xl font-medium shadow-sm backdrop-blur-sm"
                        >
                          <Play className="h-4 w-4 mr-1.5 group-hover/btn:scale-110 transition-transform duration-200" />
                          Resume
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStopClick(project)}
                          className="group/btn relative bg-gradient-to-r from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-700/95 border-gray-300/50 dark:border-gray-600/50 hover:from-red-50/95 hover:to-red-100/95 dark:hover:from-red-900/30 dark:hover:to-red-800/30 hover:border-red-400/60 dark:hover:border-red-500/60 text-gray-700 dark:text-gray-200 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 px-4 py-2 rounded-xl font-medium shadow-sm backdrop-blur-sm"
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
                  className="w-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm resize-none placeholder-gray-500 dark:placeholder-gray-400"
                  rows={4}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleConfirmStop}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm transition-all duration-200 shadow-sm"
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
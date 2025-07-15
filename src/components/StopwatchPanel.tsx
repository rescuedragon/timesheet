import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import StopwatchContainer from './stopwatch/StopwatchContainer';
import { Project, Subproject } from './TimeTracker';
import { QueuedProject } from './QueuedProjects';
import { storageService } from '@/services/storageService';

interface StopwatchPanelProps {
  selectedProject: Project | undefined;
  selectedSubproject: Subproject | undefined;
  onLogTime: (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => void;
  onPauseProject: (queuedProject: QueuedProject) => void;
  resumedProject?: QueuedProject;
  onResumedProjectHandled: () => void;
  currentFocus?: 'project' | 'subproject' | 'timer';
  onTimerStopped?: () => void;
  onAddTimeLog: (newLog: any) => void;
}

export interface StopwatchPanelRef {
  handleStart: () => void;
  handleStartStop: () => void;
  handlePause: () => void;
  handleLogTime: () => void;
}

const StopwatchPanel = forwardRef<StopwatchPanelRef, StopwatchPanelProps>(({
  selectedProject,
  selectedSubproject,
  onLogTime,
  onPauseProject,
  resumedProject,
  onResumedProjectHandled,
  currentFocus,
  onTimerStopped,
  onAddTimeLog
}, ref) => {
  const containerRef = useRef<any>(null);
  const startFnRef = useRef<() => void>();

  useImperativeHandle(ref, () => ({
    handleStart: () => {
      if (startFnRef.current) startFnRef.current();
    },
    handleStartStop: () => {},
    handlePause: () => {},
    handleLogTime: () => {},
  }), []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center"
    >
      <StopwatchContainer
        selectedProject={selectedProject}
        selectedSubproject={selectedSubproject}
        onLogTime={onLogTime}
        onPauseProject={onPauseProject}
        resumedProject={resumedProject}
        onResumedProjectHandled={onResumedProjectHandled}
        startFnRef={startFnRef}
        onTimerStopped={onTimerStopped}
        onAddTimeLog={onAddTimeLog}
      />
    </div>
  );
});

export default StopwatchPanel;
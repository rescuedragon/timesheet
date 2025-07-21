import React from 'react';
import ProjectInfo from '../timesheet/ProjectInfo';
import TimerSection from './TimerSection';
import TimeLogDialog from '../timesheet/TimeLogDialog';
import StopwatchManager from '../timesheet/StopwatchManager';
import { Project, Subproject } from '../TimeTracker';
import { QueuedProject } from '../QueuedProjects';
import { useTimeLogging } from '@/hooks/useTimeLogging';

interface StopwatchContainerProps {
  selectedProject: Project | undefined;
  selectedSubproject: Subproject | undefined;
  onLogTime: (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => void;
  onPauseProject: (queuedProject: QueuedProject) => void;
  resumedProject?: QueuedProject;
  onResumedProjectHandled: () => void;
  startFnRef?: React.MutableRefObject<(() => void) | undefined>;
  onTimerStopped?: () => void;
  onAddTimeLog: (newLog: any) => void;
}

const StopwatchContainer: React.FC<StopwatchContainerProps> = ({
  selectedProject,
  selectedSubproject,
  onLogTime,
  onPauseProject,
  resumedProject,
  onResumedProjectHandled,
  startFnRef,
  onTimerStopped,
  onAddTimeLog
}) => {
  const { logTime } = useTimeLogging();
  const [showDescriptionDialog, setShowDescriptionDialog] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [pendingLogData, setPendingLogData] = React.useState<{duration: number, startTime: Date, endTime: Date} | null>(null);
  const [currentDuration, setCurrentDuration] = React.useState(0);
  const [currentStartTime, setCurrentStartTime] = React.useState<Date | undefined>(undefined);

  const handleConfirmLog = async () => {
    if (pendingLogData && selectedProject && selectedSubproject) {
      // Use the current start time (which may have been updated by duration changes)
      const startTimeToUse = currentStartTime || pendingLogData.startTime;
      
      try {
        // Ensure we have valid project and subproject data
        if (!selectedProject.id || !selectedSubproject.id || !selectedProject.name || !selectedSubproject.name) {
          console.error('[StopwatchContainer] Invalid project or subproject data:', {
            projectId: selectedProject?.id,
            subprojectId: selectedSubproject?.id,
            projectName: selectedProject?.name,
            subprojectName: selectedSubproject?.name
          });
          throw new Error('Invalid project or subproject data');
        }
        
        console.log('[StopwatchContainer] Saving time log with:', {
          duration: currentDuration,
          description,
          startTime: startTimeToUse,
          endTime: pendingLogData.endTime,
          projectId: selectedProject.id,
          subprojectId: selectedSubproject.id,
          projectName: selectedProject.name,
          subprojectName: selectedSubproject.name
        });
        
        // Use the logTime function from useTimeLogging hook with explicit project/subproject data
        const savedLog = await logTime(
          currentDuration,
          description,
          startTimeToUse,
          pendingLogData.endTime,
          selectedProject.id,
          selectedSubproject.id,
          selectedProject.name,
          selectedSubproject.name
        );
        
        console.log('[StopwatchContainer] Saved to database via hook:', savedLog);
        
        // Add the time log to local state
        if (onAddTimeLog) {
          onAddTimeLog(savedLog);
        }
        
        // Dispatch a single event with all necessary data
        window.dispatchEvent(new CustomEvent('stopwatch-log-saved', { 
          detail: { 
            log: savedLog,
            projectId: selectedProject.id,
            subprojectId: selectedSubproject.id,
            projectName: selectedProject.name,
            subprojectName: selectedSubproject.name
          }
        }));
        
        // Force switch to the Timesheet tab
        window.dispatchEvent(new CustomEvent('switchToTimesheetTab'));
      } catch (error) {
        console.error('[StopwatchContainer] Failed to save time log to database:', error);
        alert('Failed to save time log to database. Please try again.');
      }
    } else {
      console.error('[StopwatchContainer] Cannot save time log: Missing project or subproject information', {
        pendingLogData,
        selectedProject,
        selectedSubproject
      });
      alert('Cannot save time log: Missing project or subproject information');
    }
    setShowDescriptionDialog(false);
    setDescription('');
    setPendingLogData(null);
    setCurrentDuration(0);
    setCurrentStartTime(undefined);
  };

  const handleCancelLog = () => {
    setShowDescriptionDialog(false);
    setDescription('');
    setPendingLogData(null);
    setCurrentDuration(0);
    setCurrentStartTime(undefined);
    // Clear project selection when user cancels the dialog
    if (onTimerStopped) onTimerStopped();
  };

  const handleStartTimeChange = (newStartTime: Date) => {
    setCurrentStartTime(newStartTime);
  };

  return (
    <>
      {/* Project Info */}
      <ProjectInfo 
        selectedProject={selectedProject}
        selectedSubproject={selectedSubproject}
      />
      
      <StopwatchManager
        resumedProject={resumedProject}
        onResumedProjectHandled={onResumedProjectHandled}
        selectedProject={selectedProject}
        selectedSubproject={selectedSubproject}
      >
        {(state, actions) => {
          // Expose handleStart to parent via ref
          if (startFnRef) {
            startFnRef.current = actions.handleStart;
          }
          const canStart = selectedProject && selectedSubproject && !state.isRunning;
          const canPauseOrStop = state.isRunning && state.startTime;

          const handlePause = () => {
            if (!selectedProject || !selectedSubproject || !state.startTime) return;
            
            actions.handlePause();
            
            const queuedProject: QueuedProject = {
              id: Date.now().toString(),
              projectId: selectedProject.id,
              subprojectId: selectedSubproject.id,
              projectName: selectedProject.name,
              subprojectName: selectedSubproject.name,
              elapsedTime: state.elapsedTime,
              startTime: state.startTime
            };
            
            onPauseProject(queuedProject);
          };

          const handleStop = () => {
            if (!selectedProject || !selectedSubproject || !state.startTime) return;
            
            const endTime = new Date();
            const finalDuration = state.displayTime;
            
            if (finalDuration > 0) {
              console.log('[StopwatchContainer] Stopping timer with project:', selectedProject.name, 'and subproject:', selectedSubproject.name);
              
              setPendingLogData({
                duration: finalDuration,
                startTime: state.startTime,
                endTime
              });
              setCurrentDuration(finalDuration);
              setShowDescriptionDialog(true);
            }
            
            actions.handleStop();
            actions.resetTimer();
            if (onTimerStopped) onTimerStopped();
          };

          return (
            <>
              <TimerSection
                isRunning={state.isRunning}
                elapsedTime={state.elapsedTime}
                displayTime={state.displayTime}
                canStart={canStart}
                canPauseOrStop={canPauseOrStop}
                onStart={actions.handleStart}
                onPause={handlePause}
                onStop={handleStop}
                selectedProject={selectedProject}
                selectedSubproject={selectedSubproject}
              />

              <TimeLogDialog
                open={showDescriptionDialog}
                selectedProject={selectedProject}
                selectedSubproject={selectedSubproject}
                duration={currentDuration}
                description={description}
                onDescriptionChange={setDescription}
                onConfirm={handleConfirmLog}
                onCancel={handleCancelLog}
                startTime={currentStartTime || pendingLogData?.startTime}
                endTime={pendingLogData?.endTime}
                onDurationChange={setCurrentDuration}
                onStartTimeChange={handleStartTimeChange}
              />
            </>
          );
        }}
      </StopwatchManager>
    </>
  );
};

export default StopwatchContainer;
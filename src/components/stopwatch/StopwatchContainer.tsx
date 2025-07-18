import React from 'react';
import ProjectInfo from '../timesheet/ProjectInfo';
import TimerSection from './TimerSection';
import TimeLogDialog from '../timesheet/TimeLogDialog';
import StopwatchManager from '../timesheet/StopwatchManager';
import { Project, Subproject } from '../TimeTracker';
import { QueuedProject } from '../QueuedProjects';

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
  const [showDescriptionDialog, setShowDescriptionDialog] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [pendingLogData, setPendingLogData] = React.useState<{duration: number, startTime: Date, endTime: Date} | null>(null);
  const [currentDuration, setCurrentDuration] = React.useState(0);

  const handleConfirmLog = () => {
    if (pendingLogData && selectedProject && selectedSubproject) {
      // Calculate new start time based on edited duration
      const newStartTime = new Date(pendingLogData.endTime.getTime() - (currentDuration * 1000));
      
      const newLog = {
        id: Date.now().toString(),
        projectId: selectedProject.id,
        subprojectId: selectedSubproject.id,
        projectName: selectedProject.name,
        subprojectName: selectedSubproject.name,
        duration: currentDuration,
        description,
        date: new Date().toISOString().split('T')[0],
        startTime: newStartTime.toLocaleTimeString(),
        endTime: pendingLogData.endTime.toLocaleTimeString()
      };
      console.log('StopwatchContainer - created new log:', newLog);
      onAddTimeLog(newLog);
    }
    setShowDescriptionDialog(false);
    setDescription('');
    setPendingLogData(null);
    setCurrentDuration(0);
  };

  const handleCancelLog = () => {
    setShowDescriptionDialog(false);
    setDescription('');
    setPendingLogData(null);
    setCurrentDuration(0);
    // Clear project selection when user cancels the dialog
    if (onTimerStopped) onTimerStopped();
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
                startTime={pendingLogData?.startTime}
                endTime={pendingLogData?.endTime}
                onDurationChange={setCurrentDuration}
              />
            </>
          );
        }}
      </StopwatchManager>
    </>
  );
};

export default StopwatchContainer; 
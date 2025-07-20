import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { useTimeLogging } from '@/hooks/useTimeLogging';
import { storageService } from '@/services/storageService';
import { apiService } from '@/services/apiService';
import ClickSpark from '../common/ClickSpark';
import CurrentSelectionDisplay from './CurrentSelectionDisplay';
import TimeTrackerLayout from './TimeTrackerLayout';
import QueuedProjects from '../QueuedProjects';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useQueuedProjects } from '@/hooks/useQueuedProjects';
import { useTimerStatus } from '@/hooks/useTimerStatus';
import { ProjectSelectorRef } from '../ProjectSelector';
import { StopwatchPanelRef } from '../StopwatchPanel';

export interface Project {
    id: string;
    name: string;
    subprojects: Subproject[];
    totalTime: number;
}

export interface Subproject {
    id: string;
    name: string;
    totalTime: number;
}

export interface TimeLog {
    id: string;
    projectId: string;
    subprojectId: string;
    projectName: string;
    subprojectName: string;
    duration: number;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
}

const TimeTracker = ({ onAddTimeLog }: { onAddTimeLog: (newLog: any) => void }) => {
    const {
        projects,
        addProject,
        updateProjectTimes
    } = useProjectManagement();
    const { timeLogs, logTime } = useTimeLogging();
    const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
        return storageService.getSelectedProjectId();
    });
    const [selectedSubprojectId, setSelectedSubprojectId] = useState<string>(() => {
        return storageService.getSelectedSubprojectId();
    });
    const [resumedProject, setResumedProject] = useState<any>(undefined);
    const [currentFocus, setCurrentFocus] = useState<'project' | 'subproject' | 'timer'>('project');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [autoStartTimer, setAutoStartTimer] = useState<NodeJS.Timeout | null>(null);

    // Debug logging
    console.log('TimeTracker - projects:', projects);
    console.log('TimeTracker - selectedProjectId:', selectedProjectId);

    // Use custom hooks
    const { isTimerRunning, elapsedTime } = useTimerStatus();
    const { queuedProjects, handlePauseProject: pauseProject, handleResumeProject: resumeProject, handleStopQueuedProject } = useQueuedProjects();

    // Reference to the stopwatch panel for keyboard actions
    const stopwatchRef = React.useRef<StopwatchPanelRef | null>(null);

    // Reference to the project selector for keyboard navigation
    const projectSelectorRef = React.useRef<ProjectSelectorRef | null>(null);

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Update project times when time logs change
    useEffect(() => {
        updateProjectTimes(timeLogs);
    }, [timeLogs, updateProjectTimes]);

    useEffect(() => {
        storageService.saveSelectedProjectId(selectedProjectId);
    }, [selectedProjectId]);

    useEffect(() => {
        storageService.saveSelectedSubprojectId(selectedSubprojectId);
    }, [selectedSubprojectId]);

    useEffect(() => {
        const handleUpdateSubproject = (event: any) => {
            const { projectId, subprojectId, newName } = event.detail;
            // This will be handled by the project management hook
            window.location.reload(); // Temporary solution to refresh data
        };

        const handleDeleteSubproject = (event: any) => {
            const { projectId, subprojectId } = event.detail;
            // This will be handled by the project management hook

            if (selectedSubprojectId === subprojectId) {
                setSelectedSubprojectId('');
            }
            window.location.reload(); // Temporary solution to refresh data
        };

        window.addEventListener('update-subproject', handleUpdateSubproject);
        window.addEventListener('delete-subproject', handleDeleteSubproject);

        return () => {
            window.removeEventListener('update-subproject', handleUpdateSubproject);
            window.removeEventListener('delete-subproject', handleDeleteSubproject);
        };
    }, [projects, selectedSubprojectId]);

    // Auto-start timer when both project and subproject are selected
    useEffect(() => {
        // Clear any existing timer
        if (autoStartTimer) {
            clearTimeout(autoStartTimer);
            setAutoStartTimer(null);
        }

        // Only start auto-timer if both project and subproject are selected and timer is not running
        if (selectedProjectId && selectedSubprojectId && !isTimerRunning) {
            const timer = setTimeout(() => {
                // Auto-start the timer
                if (stopwatchRef.current) {
                    stopwatchRef.current.handleStart();
                }
            }, 10000); // 10 seconds

            setAutoStartTimer(timer);
        }

        // Cleanup function
        return () => {
            if (autoStartTimer) {
                clearTimeout(autoStartTimer);
            }
        };
    }, [selectedProjectId, selectedSubprojectId, isTimerRunning, autoStartTimer]);

    // Auto-deselect project and subproject after 10 seconds if timer doesn't start
    useEffect(() => {
        let deselectionTimer: NodeJS.Timeout | null = null;

        if (selectedProjectId && selectedSubprojectId && !isTimerRunning) {
            deselectionTimer = setTimeout(() => {
                // Clear selections if timer hasn't started
                if (!isTimerRunning) {
                    setSelectedProjectId('');
                    setSelectedSubprojectId('');
                    if (projectSelectorRef.current) {
                        projectSelectorRef.current.clearSelection();
                    }
                }
            }, 10000); // 10 seconds
        }

        return () => {
            if (deselectionTimer) {
                clearTimeout(deselectionTimer);
            }
        };
    }, [selectedProjectId, selectedSubprojectId, isTimerRunning]);

    const addSubproject = (projectId: string, subprojectName: string) => {
        // This function seems to be missing the setProjects call
        // You'll need to implement this properly based on your project management hook
        console.warn('addSubproject function needs to be implemented');
    };

    const handleLogTime = async (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => {
        const targetProjectId = projectId || selectedProjectId;
        const targetSubprojectId = subprojectId || selectedSubprojectId;

        const project = projects.find(p => p.id === targetProjectId);
        const subproject = project?.subprojects.find(s => s.id === targetSubprojectId);

        if (!project || !subproject) return;

        // Compose the new log object
        const newLog = {
          projectId: targetProjectId,
          subprojectId: targetSubprojectId,
          projectName: project.name,
          subprojectName: subproject.name,
          duration,
          description,
          date: new Date().toISOString().split('T')[0],
          startTime: startTime.toLocaleTimeString(),
          endTime: endTime.toLocaleTimeString()
        };
        
        try {
          // Save to database via API
          const savedLog = await apiService.createTimeLog(newLog);
          console.log('TimeTracker - saved to database:', savedLog);
          
          // Add to local state
          onAddTimeLog(savedLog);
          
          // Save directly to storage to ensure it's available to other components
          const existingLogs = JSON.parse(localStorage.getItem('timesheet-logs') || '[]');
          const updatedLogs = [savedLog, ...existingLogs];
          localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
          
          // Dispatch events to ensure DailyView is updated with the new entry
          window.dispatchEvent(new CustomEvent('time-logs-updated'));
          window.dispatchEvent(new CustomEvent('switchToDailyView'));
        } catch (error) {
          console.error('Failed to save time log to database:', error);
          alert('Failed to save time log to database. Please try again.');
        }
    };

    const switchToExcelView = () => {
        window.dispatchEvent(new CustomEvent('switchToExcelView'));
    };

    const handlePauseProject = (queuedProject: any) => {
        pauseProject(queuedProject);
        // Deselect project and subproject when timer is paused
        setSelectedProjectId('');
        setSelectedSubprojectId('');
        if (projectSelectorRef.current) {
            projectSelectorRef.current.clearSelection();
        }
    };

    const handleResumeProject = (queuedProject: any) => {
        resumeProject(queuedProject, projects, selectedProjectId, selectedSubprojectId, setSelectedProjectId, setSelectedSubprojectId, setResumedProject);
    };

    const handleResumedProjectHandled = () => {
        setResumedProject(undefined);
    };

    // Add this handler to clear subproject when project changes
    const handleProjectSelect = (projectId: string) => {
        // Clear any existing auto-start timer
        if (autoStartTimer) {
            clearTimeout(autoStartTimer);
            setAutoStartTimer(null);
        }
        setSelectedProjectId(projectId);
        setSelectedSubprojectId('');
    };

    // Handler for subproject selection
    const handleSubprojectSelect = (subprojectId: string) => {
        // Clear any existing auto-start timer
        if (autoStartTimer) {
            clearTimeout(autoStartTimer);
            setAutoStartTimer(null);
        }
        setSelectedSubprojectId(subprojectId);
    };

    // Clear selections when timer is stopped
    const handleTimerStopped = () => {
        // Clear any existing auto-start timer
        if (autoStartTimer) {
            clearTimeout(autoStartTimer);
            setAutoStartTimer(null);
        }
        // Clear project and subproject selections
        setSelectedProjectId('');
        setSelectedSubprojectId('');
        if (projectSelectorRef.current) {
            projectSelectorRef.current.clearSelection();
        }
    };

    // Ensure only one timer runs at a time, pause and queue previous if needed
    const handleStartNewTimerForProject = (projectId: string, subprojectId: string) => {
        const stopwatchState = storageService.getStopwatchState();
        if (stopwatchState?.isRunning && stopwatchState.startTime) {
            // Pause and queue the current running timer
            const currentProject = projects.find(p => p.id === selectedProjectId);
            const currentSubproject = currentProject?.subprojects.find(s => s.id === selectedSubprojectId);
            if (currentProject && currentSubproject) {
                const now = new Date();
                const sessionTime = Math.floor((now.getTime() - new Date(stopwatchState.startTime).getTime()) / 1000);
                const totalElapsed = (stopwatchState.elapsedTime || 0) + sessionTime;
                const queuedProject = {
                    id: Date.now().toString(),
                    projectId: selectedProjectId,
                    subprojectId: selectedSubprojectId,
                    projectName: currentProject.name,
                    subprojectName: currentSubproject.name,
                    elapsedTime: totalElapsed,
                    startTime: new Date(stopwatchState.startTime)
                };
                pauseProject(queuedProject);
            }
        }
        setSelectedProjectId(projectId);
        setSelectedSubprojectId(subprojectId);
        setTimeout(() => { stopwatchRef.current?.handleStart(); }, 100);
    };

    // Use keyboard shortcuts hook
    useKeyboardShortcuts({
        currentFocus,
        projectSelectorRef,
        stopwatchRef,
        onSwitchToExcelView: switchToExcelView
    });

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const selectedSubproject = selectedProject?.subprojects.find(s => s.id === selectedSubprojectId);

    return (
        <div className="relative min-h-screen bg-transparent">
            {/* Subtle background pattern */}
            {/* Remove background pattern overlay to ensure full transparency */}

            <TimeTrackerLayout
                projects={projects}
                selectedProjectId={selectedProjectId}
                selectedSubprojectId={selectedSubprojectId}
                onProjectSelect={handleProjectSelect}
                onSubprojectSelect={handleSubprojectSelect}
                onAddProject={addProject}
                onAddSubproject={addSubproject}
                selectedProject={selectedProject}
                selectedSubproject={selectedSubproject}
                onLogTime={handleLogTime}
                onPauseProject={handlePauseProject}
                resumedProject={resumedProject}
                onResumedProjectHandled={handleResumedProjectHandled}
                currentFocus={currentFocus}
                onFocusChange={setCurrentFocus}
                projectSelectorRef={projectSelectorRef}
                stopwatchRef={stopwatchRef}
                handleStartNewTimerForProject={handleStartNewTimerForProject}
                onTimerStopped={handleTimerStopped}
                isTimerRunning={isTimerRunning}
                onAddTimeLog={onAddTimeLog}
                elapsedTime={elapsedTime}
            />

            <div className="w-[95%] mx-auto flex flex-col min-h-0 p-6">
                <QueuedProjects
                    queuedProjects={queuedProjects}
                    onResumeProject={handleResumeProject}
                    onStopProject={handleStopQueuedProject}
                    onLogTime={handleLogTime}
                    isTimerRunning={isTimerRunning}
                />
            </div>
        </div>
    );
};

export default TimeTracker; 
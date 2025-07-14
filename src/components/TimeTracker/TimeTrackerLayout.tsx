import React from 'react';
import ProjectSelector from '../ProjectSelector';
import StopwatchPanel from '../StopwatchPanel';
import { Project, Subproject } from './CurrentSelectionDisplay';
import { QueuedProject } from '../QueuedProjects';
import { ProjectSelectorRef } from '../ProjectSelector';
import { StopwatchPanelRef } from '../StopwatchPanel';
import ProjectSubprojectSearchBar from '../project-selector/ProjectSubprojectSearchBar';

interface TimeTrackerLayoutProps {
    projects: Project[];
    selectedProjectId: string;
    selectedSubprojectId: string;
    onProjectSelect: (projectId: string) => void;
    onSubprojectSelect: (subprojectId: string) => void;
    onAddProject: (projectName: string, subprojectName?: string) => void;
    onAddSubproject: (projectId: string, subprojectName: string) => void;
    selectedProject: Project | undefined;
    selectedSubproject: Subproject | undefined;
    onLogTime: (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => void;
    onPauseProject: (queuedProject: QueuedProject) => void;
    resumedProject: QueuedProject | undefined;
    onResumedProjectHandled: () => void;
    currentFocus: 'project' | 'subproject' | 'timer';
    onFocusChange: (focus: 'project' | 'subproject' | 'timer') => void;
    projectSelectorRef: React.MutableRefObject<ProjectSelectorRef | null>;
    stopwatchRef: React.MutableRefObject<StopwatchPanelRef | null>;
    handleStartNewTimerForProject: (projectId: string, subprojectId: string) => void;
    onTimerStopped: () => void;
    isTimerRunning: boolean;
    onAddTimeLog: (newLog: any) => void;
}

const TimeTrackerLayout: React.FC<TimeTrackerLayoutProps> = ({
    projects,
    selectedProjectId,
    selectedSubprojectId,
    onProjectSelect,
    onSubprojectSelect,
    onAddProject,
    onAddSubproject,
    selectedProject,
    selectedSubproject,
    onLogTime,
    onPauseProject,
    resumedProject,
    onResumedProjectHandled,
    currentFocus,
    onFocusChange,
    projectSelectorRef,
    stopwatchRef,
    handleStartNewTimerForProject,
    onTimerStopped,
    isTimerRunning,
    onAddTimeLog
}) => {
    return (
        <div className="w-full flex flex-col gap-6">
            {/* Search Bar remains above the split */}
            <div className="w-full max-w-7xl mx-auto relative">
                <ProjectSubprojectSearchBar
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    selectedSubprojectId={selectedSubprojectId}
                    onProjectSelect={onProjectSelect}
                    onSubprojectSelect={onSubprojectSelect}
                />
            </div>

            {/* Strict 50/50 split, both panels w-1/2, h-[90%], min-h-0 */}
            <div className="w-full max-w-7xl mx-auto flex flex-row gap-6 h-[76.5vh] min-h-0">
                {/* Left: ProjectSelector */}
                <div className="w-1/2 h-full min-h-0 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-0 m-0">
                    <ProjectSelector
                        ref={projectSelectorRef}
                        projects={projects}
                        selectedProjectId={selectedProjectId}
                        selectedSubprojectId={selectedSubprojectId}
                        onProjectSelect={onProjectSelect}
                        onSubprojectSelect={onSubprojectSelect}
                        onAddProject={onAddProject}
                        onAddSubproject={onAddSubproject}
                        currentFocus={currentFocus}
                        onFocusChange={onFocusChange}
                        stopwatchRef={stopwatchRef}
                        handleStartNewTimerForProject={handleStartNewTimerForProject}
                        isTimerRunning={isTimerRunning}
                    />
                </div>
                {/* Right: StopwatchPanel */}
                <div className="w-1/2 h-full min-h-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <StopwatchPanel
                        ref={stopwatchRef}
                        selectedProject={selectedProject}
                        selectedSubproject={selectedSubproject}
                        onLogTime={onLogTime}
                        onPauseProject={onPauseProject}
                        resumedProject={resumedProject}
                        onResumedProjectHandled={onResumedProjectHandled}
                        currentFocus={currentFocus}
                        onTimerStopped={onTimerStopped}
                        onAddTimeLog={onAddTimeLog}
                    />
                </div>
            </div>
        </div>
    );
};

export default TimeTrackerLayout; 
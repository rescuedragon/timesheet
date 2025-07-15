import React from 'react';
import ProjectSelector from '../ProjectSelector';
import StopwatchPanel from '../StopwatchPanel';
import { Project, Subproject } from './CurrentSelectionDisplay';
import { QueuedProject } from '../QueuedProjects';
import { ProjectSelectorRef } from '../ProjectSelector';
import { StopwatchPanelRef } from '../StopwatchPanel';
import ProjectSubprojectSearchBar from '../project-selector/ProjectSubprojectSearchBar';
import CurrentTrackingDisplay from '../common/CurrentTrackingDisplay';
import QueuedProjects from '../QueuedProjects';
import { useState } from 'react';

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

const TimeTrackerLayout: React.FC<TimeTrackerLayoutProps & { queuedProjects: any[]; onResumeProject: any; onStopProject: any; }> = ({
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
    onAddTimeLog,
    queuedProjects,
    onResumeProject,
    onStopProject
}) => {
    // Responsive layout: top, search row, main row, bottom
    const [leftTab, setLeftTab] = useState<'projects' | 'quickstart'>('projects');
    // Wrap all main content in a 90% width container
    return (
        <div className="w-[95%] mx-auto box-border">
            {/* 1. Currently Tracking (top, full width, fixed height) */}
            <div className="w-full flex-shrink-0 currently-tracking-material mt-6 mb-6 rounded-2xl box-border" style={{ minHeight: '90px', maxHeight: '120px', background: 'linear-gradient(90deg, #4285F4 0%, #34A853 100%)', color: '#fff' }}>
                <CurrentTrackingDisplay
                    selectedProject={selectedProject}
                    selectedSubproject={selectedSubproject}
                    isTimerRunning={isTimerRunning}
                    currentTime={new Date()}
                />
            </div>

            {/* 2. Search Row (projects left, subprojects right) */}
            <div className="w-full flex flex-row items-stretch justify-stretch h-[400px]">
                {/* Left: ProjectSelector */}
                <div className="w-1/2 h-full flex flex-col">
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
                        queuedProjects={queuedProjects}
                        onResumeProject={onResumeProject}
                        onStopProject={onStopProject}
                        onLogTime={onLogTime}
                    />
                </div>
                {/* Right: StopwatchPanel */}
                <div className="w-1/2 h-full flex flex-col items-center justify-center">
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

            {/* 4. Paused/Queued Section (bottom, full width, matches top height) */}
            <div className="w-full flex-shrink-0 mt-6 mb-2 rounded-2xl box-border" style={{ minHeight: '90px', maxHeight: '120px' }}>
                <QueuedProjects
                    queuedProjects={queuedProjects}
                    onResumeProject={onResumeProject}
                    onStopProject={onStopProject}
                    onLogTime={onLogTime}
                />
            </div>
        </div>
    );
};

export default TimeTrackerLayout; 
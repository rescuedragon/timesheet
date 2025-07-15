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
    // Main container that auto-fits to screen size
    return (
        <div className="w-full h-[90vh] flex flex-col min-h-0">
            <div className="w-[95%] mx-auto flex flex-col min-h-0 flex-1 p-6 gap-6 h-full">
                {/* Top: Currently Tracking (fixed height) */}
                <div className="w-full flex-shrink-0 currently-tracking-material rounded-2xl box-border" style={{ minHeight: '120px', maxHeight: '160px', color: '#fff' }}>
                    <CurrentTrackingDisplay
                        selectedProject={selectedProject}
                        selectedSubproject={selectedSubproject}
                        isTimerRunning={isTimerRunning}
                        currentTime={new Date()}
                    />
                </div>
                {/* Main Content Row: fills all available space */}
                <div className="flex-1 min-h-0 flex flex-row">
                    {/* Left Glass Subcontainer: ProjectSelector */}
                    <div className="flex-1 min-h-0 flex flex-col backdrop-blur-md bg-white/20 border border-white/40 rounded-2xl shadow-md">
                        <div className="flex-1 min-h-0 flex flex-col">
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
                    </div>
                    {/* Right Glass Subcontainer: StopwatchPanel */}
                    <div className="flex-1 min-h-0 flex flex-col backdrop-blur-md bg-white/20 border border-white/40 rounded-2xl shadow-md">
                        <div className="flex-1 min-h-0 flex flex-col">
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
            </div>
        </div>
    );
};

export default TimeTrackerLayout; 
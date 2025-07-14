import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { Search, Play, ChevronDown, Timer, ChevronLeft } from 'lucide-react';
import { StopwatchPanelRef } from './StopwatchPanel';
import ShinyText from './common/ShinyText';
import { generateProjectColor } from '../lib/projectColors';
import tinycolor2 from 'tinycolor2';
import { useSettings } from '@/hooks/useSettings';

// ========== Interfaces ==========
interface Project {
  id: string;
  name: string;
  subprojects: Subproject[];
  totalTime: number;
}

interface Subproject {
  id: string;
  name: string;
  totalTime: number;
}

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string;
  selectedSubprojectId: string;
  onProjectSelect: (projectId: string) => void;
  onSubprojectSelect: (subprojectId: string) => void;
  onAddProject: (projectName: string, subprojectName?: string) => void;
  onAddSubproject: (projectId: string, subprojectName: string) => void;
  currentFocus?: 'project' | 'subproject' | 'timer';
  onFocusChange?: (focus: 'project' | 'subproject' | 'timer') => void;
  stopwatchRef?: React.MutableRefObject<StopwatchPanelRef | null>;
  handleStartNewTimerForProject?: (projectId: string, subprojectId: string) => void;
  isTimerRunning?: boolean;
}

export interface ProjectSelectorRef {
  focusProjectSearch: () => void;
  focusSubprojectSearch: () => void;
  selectProject: (direction: 'up' | 'down') => void;
  selectSubproject: (direction: 'up' | 'down') => void;
  confirmProjectSelection: () => void;
  confirmSubprojectSelection: () => void;
  clearSelection: () => void;
}

// ========== Main Component ==========
const ProjectSelector = forwardRef<ProjectSelectorRef, ProjectSelectorProps>(({
  projects,
  selectedProjectId,
  selectedSubprojectId,
  onProjectSelect,
  onSubprojectSelect,
  onAddProject,
  onAddSubproject,
  currentFocus,
  onFocusChange,
  stopwatchRef,
  handleStartNewTimerForProject,
  isTimerRunning
}, ref) => {
  const [projectSearch, setProjectSearch] = useState('');
  const [subprojectSearch, setSubprojectSearch] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showSubprojectDropdown, setShowSubprojectDropdown] = useState(false);
  const [projectDropdownSearch, setProjectDropdownSearch] = useState('');
  const [subprojectDropdownSearch, setSubprojectDropdownSearch] = useState('');
  const [frequentSubprojectsEnabled, setFrequentSubprojectsEnabled] = useState(true);
  const [frequentProjects, setFrequentProjects] = useState<Project[]>([]);
  const [frequentSubprojects, setFrequentSubprojects] = useState<Subproject[]>([]);
  const [projectUsageCount, setProjectUsageCount] = useState<Record<string, number>>({});
  const [subprojectUsageCount, setSubprojectUsageCount] = useState<Record<string, number>>({});
  const [combinationUsageCount, setCombinationUsageCount] = useState<Record<string, number>>({});
  const [pendingQuickStart, setPendingQuickStart] = useState<{ projectId: string; subprojectId: string; index: number } | null>(null);
  const quickStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { colorCodedProjectsEnabled } = useSettings();

  // Create refs for callbacks
  const onProjectSelectRef = useRef(onProjectSelect);
  const onSubprojectSelectRef = useRef(onSubprojectSelect);
  
  // Update refs on every render
  useEffect(() => {
    onProjectSelectRef.current = onProjectSelect;
    onSubprojectSelectRef.current = onSubprojectSelect;
  });

  // Demo data - 15 projects with 3 subprojects each
  const demoProjects: Project[] = Array.from({ length: 15 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Project ${i + 1}`,
    totalTime: 0,
    subprojects: Array.from({ length: 3 }, (_, j) => ({
      id: `${i + 1}-${j + 1}`,
      name: `Subproject ${j + 1}`,
      totalTime: 0
    }))
  }));

  // Use demo data if no projects provided
  const allProjects = projects.length > 0 ? projects : demoProjects;

  // Memoized selected project and subproject
  const selectedProject = React.useMemo(() => 
    allProjects.find(p => p.id === selectedProjectId), [allProjects, selectedProjectId]);
  
  const selectedSubproject = React.useMemo(() => 
    selectedProject?.subprojects.find(s => s.id === selectedSubprojectId), 
    [selectedProject, selectedSubprojectId]);

  // Track frequent projects based on usage count
  useEffect(() => {
    const sorted = [...allProjects]
      .sort((a, b) => (projectUsageCount[b.id] || 0) - (projectUsageCount[a.id] || 0))
      .slice(0, 6);
    setFrequentProjects(sorted);
  }, [allProjects, projectUsageCount]);

  // Track frequent subprojects based on usage count, but only for the selected project
  useEffect(() => {
    if (selectedProject) {
      const sorted = [...selectedProject.subprojects]
        .sort((a, b) => (subprojectUsageCount[b.id] || 0) - (subprojectUsageCount[a.id] || 0))
          .slice(0, 6);
        setFrequentSubprojects(sorted);
    } else {
      setFrequentSubprojects([]);
    }
  }, [selectedProject, subprojectUsageCount]);

  // Update search fields when selections change
  useEffect(() => {
    if (selectedProject) {
      setProjectSearch(selectedProject.name);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedSubproject) {
      setSubprojectSearch(selectedSubproject.name);
    }
  }, [selectedSubproject]);

  useEffect(() => {
    // When the main project changes, reset subproject search fields
    setSubprojectSearch('');
    setSubprojectDropdownSearch('');
  }, [selectedProjectId]);

  const subprojectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProjectIdRef = useRef<string | null>(null);

  // 17-second timeout logic - fixed
  useEffect(() => {
    // Clear any existing timer
    if (subprojectTimeoutRef.current) {
      clearTimeout(subprojectTimeoutRef.current);
      subprojectTimeoutRef.current = null;
    }
    
    // Start new timer if project is selected but no subproject
    if (selectedProjectId && !selectedSubprojectId) {
      lastProjectIdRef.current = selectedProjectId;
      
      subprojectTimeoutRef.current = setTimeout(() => {
        // Only clear if still in the same state
        if (selectedProjectId === lastProjectIdRef.current && !selectedSubprojectId) {
          onProjectSelectRef.current('');
          onSubprojectSelectRef.current('');
          setProjectSearch('');
          setSubprojectSearch('');
        }
      }, 17000);
    }
    
    // Cleanup on unmount
    return () => {
      if (subprojectTimeoutRef.current) {
        clearTimeout(subprojectTimeoutRef.current);
        subprojectTimeoutRef.current = null;
      }
    };
  }, [selectedProjectId, selectedSubprojectId]);

  const handleProjectSelect = useCallback((projectId: string) => {
    const project = allProjects.find(p => p.id === projectId);
    if (project) {
      onProjectSelect(projectId);
      setProjectSearch(project.name);
      setShowProjectDropdown(false);
      setProjectDropdownSearch('');
      // Track usage
      setProjectUsageCount(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || 0) + 1
      }));
    }
  }, [allProjects, onProjectSelect]);

  const handleSubprojectSelect = useCallback((subprojectId: string, projectOverride?: Project) => {
    const projectToUse = projectOverride || selectedProject;
    if (projectToUse) {
      const subproject = projectToUse.subprojects.find(s => s.id === subprojectId);
      if (subproject) {
        onSubprojectSelect(subprojectId);
        setSubprojectSearch(subproject.name);
        setShowSubprojectDropdown(false);
        setSubprojectDropdownSearch('');
        setSubprojectUsageCount(prev => ({
          ...prev,
          [subprojectId]: (prev[subprojectId] || 0) + 1
        }));
      }
    }
  }, [selectedProject, onSubprojectSelect]);

  const handleCombinationClick = useCallback((project: Project, subproject: Subproject, index: number) => {
    if (pendingQuickStart && pendingQuickStart.projectId === project.id && pendingQuickStart.subprojectId === subproject.id) {
      // Second click: confirm and start timer
      handleProjectSelect(project.id);
      handleSubprojectSelect(subproject.id);
      if (typeof handleStartNewTimerForProject === 'function') {
        setTimeout(() => { handleStartNewTimerForProject(project.id, subproject.id); }, 100);
      } else if (stopwatchRef && stopwatchRef.current && typeof stopwatchRef.current.handleStart === 'function') {
        setTimeout(() => { stopwatchRef.current?.handleStart(); }, 100);
      }
      setPendingQuickStart(null);
      // Track combination usage
      const combinationKey = `${project.id}-${subproject.id}`;
      setCombinationUsageCount(prev => ({
        ...prev,
        [combinationKey]: (prev[combinationKey] || 0) + 1
      }));
      return;
    }
    // First click: show confirmation on this button and clear selection
    setPendingQuickStart({ projectId: project.id, subprojectId: subproject.id, index });
    handleProjectSelect('');
    handleSubprojectSelect('');
  }, [handleProjectSelect, handleSubprojectSelect, stopwatchRef, handleStartNewTimerForProject, pendingQuickStart]);

  const filteredProjects = React.useMemo(() => 
    allProjects.filter(project =>
      project.name.toLowerCase().startsWith(projectDropdownSearch.toLowerCase())
    ), [allProjects, projectDropdownSearch]);

  const filteredSubprojects = React.useMemo(() => 
    selectedProject?.subprojects.filter(subproject =>
      subproject.name.toLowerCase().includes(subprojectDropdownSearch.toLowerCase())
    ) || [], [selectedProject, subprojectDropdownSearch]);

  // Create frequent combinations based on usage
  const frequentCombinations = React.useMemo(() => {
    const allCombinations = [];
    
    // Create all possible combinations from all projects and subprojects
    allProjects.forEach(project => {
      project.subprojects.forEach(subproject => {
        const combinationKey = `${project.id}-${subproject.id}`;
        const usageCount = combinationUsageCount[combinationKey] || 0;
        allCombinations.push({
          project,
          subproject,
          usageCount,
          combinationKey
        });
      });
    });
    
    // Sort by usage count and take top 6
    return allCombinations
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 6)
      .map(({ project, subproject }) => ({ project, subproject }));
  }, [allProjects, combinationUsageCount]);

  // Add refs for inputs
  const projectInputRef = useRef<HTMLInputElement>(null);
  const subprojectInputRef = useRef<HTMLInputElement>(null);

  // Add refs for dropdown items
  const projectDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const subprojectDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track which input is currently focused
  const [focusedInput, setFocusedInput] = useState<'project' | 'subproject' | null>(null);

  // Keyboard navigation state for project dropdown
  const [projectDropdownIndex, setProjectDropdownIndex] = useState<number>(-1);

  // Global keydown handler for Enter - only triggers when no input is focused
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isTimerRunning && !focusedInput) {
        setProjectSearch('');
        onProjectSelect(''); // Deselect any project
        setShowProjectDropdown(true);
        projectInputRef.current?.focus();
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isTimerRunning, onProjectSelect, focusedInput]);

  // Handle keyboard navigation in project dropdown
  const handleProjectInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showProjectDropdown) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setProjectDropdownIndex(prev => {
        const newIndex = prev < 0 ? 0 : prev + 1;
        return newIndex < filteredProjects.length ? newIndex : prev;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setProjectDropdownIndex(prev => {
        const newIndex = prev <= 0 ? 0 : prev - 1;
        return newIndex;
      });
    } else if ((e.key === 'Enter' || e.key === 'Tab') && projectDropdownIndex >= 0) {
      const project = filteredProjects[projectDropdownIndex];
      if (project) {
        handleProjectSelect(project.id);
        setShowProjectDropdown(false);
        setProjectDropdownIndex(-1);
        // Move focus to subproject input after selection
        setTimeout(() => {
          subprojectInputRef.current?.focus();
        }, 0);
      }
      e.preventDefault();
    }
  }, [showProjectDropdown, projectDropdownIndex, filteredProjects.length, handleProjectSelect]);

  // Keyboard navigation state for subproject dropdown
  const [subprojectDropdownIndex, setSubprojectDropdownIndex] = useState<number>(-1);

  // Handle keyboard navigation in subproject dropdown
  const handleSubprojectInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSubprojectDropdown) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSubprojectDropdownIndex(prev => {
        const newIndex = prev < 0 ? 0 : prev + 1;
        return newIndex < filteredSubprojects.length ? newIndex : prev;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSubprojectDropdownIndex(prev => {
        const newIndex = prev <= 0 ? 0 : prev - 1;
        return newIndex;
      });
    } else if ((e.key === 'Enter' || e.key === 'Tab') && subprojectDropdownIndex >= 0) {
      const subproject = filteredSubprojects[subprojectDropdownIndex];
      if (subproject) {
        handleSubprojectSelect(subproject.id);
        setShowSubprojectDropdown(false);
        setSubprojectDropdownIndex(-1);
        (e.target as HTMLInputElement).blur();
        // Focus the main project search input after selection
        projectInputRef.current?.focus();
      }
      e.preventDefault();
    }
  }, [showSubprojectDropdown, subprojectDropdownIndex, filteredSubprojects.length, handleSubprojectSelect]);



  // Add useEffect to scroll selected project into view
  useEffect(() => {
    if (showProjectDropdown && projectDropdownIndex >= 0 && projectDropdownRefs.current[projectDropdownIndex]) {
      projectDropdownRefs.current[projectDropdownIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [projectDropdownIndex, showProjectDropdown]);
  // Add useEffect to scroll selected subproject into view
  useEffect(() => {
    if (showSubprojectDropdown && subprojectDropdownIndex >= 0 && subprojectDropdownRefs.current[subprojectDropdownIndex]) {
      subprojectDropdownRefs.current[subprojectDropdownIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [subprojectDropdownIndex, showSubprojectDropdown]);

  // Space bar to start/stop timer
  useEffect(() => {
    const handleSpaceBar = (e: KeyboardEvent) => {
      // Only trigger if both project and subproject are selected
      if (e.key === ' ' && selectedProjectId && selectedSubprojectId) {
        // Prevent space from scrolling the page
        e.preventDefault();
        
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        
        if (isTimerRunning) {
          // Stop the timer - use handleStartStop to toggle
          if (stopwatchRef?.current?.handleStartStop) {
            stopwatchRef.current.handleStartStop();
          }
        } else {
          // Start the timer
          if (handleStartNewTimerForProject) {
            handleStartNewTimerForProject(selectedProjectId, selectedSubprojectId);
          } else if (stopwatchRef?.current?.handleStart) {
            stopwatchRef.current.handleStart();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleSpaceBar);
    return () => window.removeEventListener('keydown', handleSpaceBar);
  }, [selectedProjectId, selectedSubprojectId, isTimerRunning, stopwatchRef, handleStartNewTimerForProject]);

  useImperativeHandle(ref, () => ({
    focusProjectSearch: () => {
      projectInputRef.current?.focus();
    },
    focusSubprojectSearch: () => {
      subprojectInputRef.current?.focus();
    },
    selectProject: (direction: 'up' | 'down') => {
      // This is handled by the input keydown handlers
    },
    selectSubproject: (direction: 'up' | 'down') => {
      // This is handled by the input keydown handlers
    },
    confirmProjectSelection: () => {
      if (showProjectDropdown && projectDropdownIndex >= 0) {
        const project = filteredProjects[projectDropdownIndex];
        if (project) {
          handleProjectSelect(project.id);
          setShowProjectDropdown(false);
          setProjectDropdownIndex(-1);
        }
      }
    },
    confirmSubprojectSelection: () => {
      if (showSubprojectDropdown && subprojectDropdownIndex >= 0) {
        const subproject = filteredSubprojects[subprojectDropdownIndex];
        if (subproject) {
          handleSubprojectSelect(subproject.id);
          setShowSubprojectDropdown(false);
          setSubprojectDropdownIndex(-1);
        }
      }
    },
    clearSelection: () => {
      setProjectSearch('');
      setSubprojectSearch('');
    }
  }));

  // Apple-inspired unified container with animated header and 3x2 squircle grid
  const [headerFade, setHeaderFade] = useState(true);
  useEffect(() => {
    setHeaderFade(false);
    const timeout = setTimeout(() => setHeaderFade(true), 150);
    return () => clearTimeout(timeout);
  }, [selectedProjectId]);

  const showSubprojects = !!selectedProjectId && selectedProject;
  const topGridItems = showSubprojects
    ? (selectedProject?.subprojects.slice(0, 6) || [])
    : frequentProjects.slice(0, 6);
  const bottomGridItems = frequentCombinations;

  const handleQuickStartClick = (project: Project, subproject: Subproject, index: number) => {
    if (
      pendingQuickStart &&
      pendingQuickStart.projectId === project.id &&
      pendingQuickStart.subprojectId === subproject.id
    ) {
      // Second click within 5 seconds: start timer
      if (typeof handleStartNewTimerForProject === 'function') {
        handleStartNewTimerForProject(project.id, subproject.id);
      }
      setPendingQuickStart(null);
      if (quickStartTimeoutRef.current) {
        clearTimeout(quickStartTimeoutRef.current);
        quickStartTimeoutRef.current = null;
      }
      return;
    }
    // First click: show confirmation and set timeout
    setPendingQuickStart({ projectId: project.id, subprojectId: subproject.id, index });
    if (quickStartTimeoutRef.current) {
      clearTimeout(quickStartTimeoutRef.current);
    }
    quickStartTimeoutRef.current = setTimeout(() => {
      setPendingQuickStart(null);
    }, 5000);
  };

  return (
    <div className="w-full h-full flex flex-col p-3 m-0 min-h-0">
      {/* Top half: Most Frequent Projects/Subprojects */}
      <div className="flex-1 min-h-0 flex flex-col border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900/60 shadow-sm pb-2.5" style={{height: '40%', minHeight: 0}}>
        <div className="relative text-xl font-bold mb-1.5 px-2.5 py-1.5 rounded-t-2xl flex items-center justify-between" style={{ minHeight: '1.36rem', fontSize: '1.02rem', letterSpacing: '-0.01em', background: 'rgba(150, 150, 160, 0.88)' }}>
          {/* Left spacer for symmetry */}
          <div style={{ minWidth: 28 }} />
          {/* Centered header text */}
          <div className="flex-1 flex items-center justify-center w-full">
            <span className="relative z-10">{showSubprojects ? 'Frequently used Subprojects' : 'Frequently used Projects'}</span>
          </div>
          {/* Back button (right, only in subproject view) */}
          <div className="flex items-center" style={{ minWidth: 28 }}>
            {showSubprojects && (
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-200 transition z-10"
                onClick={() => onProjectSelect('')}
                tabIndex={0}
                aria-label="Back to Frequently used Projects"
              >
                <ChevronLeft size={18} strokeWidth={2.2} />
              </button>
            )}
          </div>
          {/* Glassmorphism overlay */}
          <span className="absolute inset-0 rounded-t-2xl bg-white/30 backdrop-blur-md border-b border-white/40 pointer-events-none z-0" />
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-3 gap-1.5 w-full h-full px-3.5">
          {topGridItems.length === 0 && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[1.05rem] bg-gray-100/60 shadow-none h-full w-full" />
          ))}
          {topGridItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => {
                if (showSubprojects) {
                  onSubprojectSelect(item.id);
                } else {
                  onProjectSelect(item.id);
                }
              }}
              className={
                'w-full h-full flex-1 min-h-0 flex items-center justify-center rounded-[1.05rem] shadow-lg transition-all duration-200 text-base font-semibold text-white select-none cursor-pointer relative overflow-hidden group' +
                ' hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-400/40'
              }
              style={{
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
                background: colorCodedProjectsEnabled
                  ? (() => {
                      const base = showSubprojects && selectedProject
                        ? generateProjectColor(selectedProject.name)
                        : (!showSubprojects && item.name
                          ? generateProjectColor(item.name)
                          : '#6366f1');
                      return base;
                    })()
                  : 'linear-gradient(120deg, #fff 0%, #f3f4f6 100%)',
                color: colorCodedProjectsEnabled
                  ? (() => {
                      const base = showSubprojects && selectedProject
                        ? generateProjectColor(selectedProject.name)
                        : (!showSubprojects && item.name
                          ? generateProjectColor(item.name)
                          : '#6366f1');
                      return tinycolor2(base).isLight() ? '#222' : '#fff';
                    })()
                  : '#222',
                fontSize: '0.88em',
                boxShadow: '0 4.8px 25.6px 0 rgba(80,80,160,0.10), 0 1.2px 6.4px 0 rgba(0,0,0,0.08)'
              }}
            >
              <span className="z-10">{item.name}</span>
              {/* Glassy/shine hover effect */}
              {colorCodedProjectsEnabled && (
                <span className="absolute inset-0 rounded-[1.05rem] bg-white/50 backdrop-blur-lg border-2 border-white/60 pointer-events-none z-0" />
              )}
              <span className="absolute inset-0 rounded-[1.05rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 60%, transparent 100%)'}} />
            </button>
          ))}
        </div>
      </div>
      {/* Bottom half: Quick Start Combinations */}
      <div className="flex-1 min-h-0 flex flex-col border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900/60 shadow-sm mt-3.5 pb-2.5" style={{height: '40%', minHeight: 0}}>
        <div className="relative text-xl font-bold mt-0 mb-1.5 px-2.5 py-1.5 text-center rounded-t-2xl flex items-center justify-center gap-2" style={{ minHeight: '1.36rem', fontSize: '1.02rem', letterSpacing: '-0.01em', background: 'rgba(150, 150, 160, 0.88)' }}>
          <span className="relative z-10 flex items-center gap-2">
            <Timer size={18} strokeWidth={2.2} className="inline-block align-middle" />
            Quick Start
          </span>
          {/* Glassmorphism overlay */}
          <span className="absolute inset-0 rounded-t-2xl bg-white/30 backdrop-blur-md border-b border-white/40 pointer-events-none z-0" />
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-3 gap-1.5 w-full h-full px-3.5">
          {bottomGridItems.length === 0 && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[1.05rem] bg-gray-100/60 shadow-none h-full w-full" />
          ))}
          {bottomGridItems.map((item, idx) => {
            const isPending =
              pendingQuickStart &&
              pendingQuickStart.projectId === item.project.id &&
              pendingQuickStart.subprojectId === item.subproject.id;
            return (
              <button
                key={item.project.id + '-' + item.subproject.id}
                onClick={() => handleQuickStartClick(item.project, item.subproject, idx)}
                className={
                  'w-full h-full flex-1 min-h-0 flex items-center justify-between shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 text-base font-semibold select-none cursor-pointer relative overflow-hidden isolation-isolate rounded-[1.05rem] group' +
                  (colorCodedProjectsEnabled ? ' glassmorphism-btn' : '') +
                  ' hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-400/40' +
                  (isPending ? ' bg-black text-white' : '')
                }
                style={
                  isPending
                    ? { background: '#000', color: '#fff', fontSize: '1.1em', justifyContent: 'center' }
                    : {
                        fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
                        background: colorCodedProjectsEnabled
                          ? (() => {
                              const base = item.project && item.project.name
                                ? generateProjectColor(item.project.name)
                                : '#6366f1';
                              return base;
                            })()
                          : 'linear-gradient(120deg, #fff 0%, #f3f4f6 100%)',
                        color: colorCodedProjectsEnabled
                          ? (() => {
                              const base = item.project && item.project.name
                                ? generateProjectColor(item.project.name)
                                : '#6366f1';
                              return tinycolor2(base).isLight() ? '#222' : '#fff';
                            })()
                          : '#222',
                        fontSize: '0.88em',
                        boxShadow: '0 4.8px 25.6px 0 rgba(80,80,160,0.10), 0 1.2px 6.4px 0 rgba(0,0,0,0.08)'
                      }
                }
              >
                {isPending ? (
                  <span className="w-full text-center font-bold text-lg">Tap to run timer</span>
                ) : (
                  <>
                    <span className="z-10 flex flex-col items-start justify-center text-left pl-4">
                      <span className="block text-base font-semibold mb-0.5 leading-tight">{item.project.name}</span>
                      <span className="block text-sm font-normal opacity-80 leading-tight">{item.subproject.name}</span>
                    </span>
                    <span className="z-10 pr-2 flex items-center justify-center">
                      <Timer size={20} strokeWidth={2.2} />
                    </span>
                    {/* Glassy/shine hover effect */}
                    {colorCodedProjectsEnabled && (
                      <span className="absolute inset-0 rounded-[1.05rem] bg-white/50 backdrop-blur-lg border-2 border-white/60 pointer-events-none z-0" style={{overflow: 'hidden'}} />
                    )}
                    <span className="absolute inset-0 rounded-[1.05rem] pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 60%, transparent 100%)', overflow: 'hidden'}} />
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

ProjectSelector.displayName = 'ProjectSelector';

export default ProjectSelector;
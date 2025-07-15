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
  showQuickStartOnly?: boolean;
  queuedProjects?: any[];
  onResumeProject?: any;
  onStopProject?: any;
  onLogTime?: (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => void;
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
  isTimerRunning,
  showQuickStartOnly
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
  // Global search state
  const [globalSearch, setGlobalSearch] = useState('');
  const [showGlobalDropdown, setShowGlobalDropdown] = useState(false);
  const [globalDropdownIndex, setGlobalDropdownIndex] = useState<number>(-1);

  // Add state for search bar focus
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Add state for dropdown mode and selected project for subprojects
  const [dropdownMode, setDropdownMode] = useState<'projects' | 'subprojects'>('projects');
  const [selectedDropdownProject, setSelectedDropdownProject] = useState<Project | null>(null);

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
    // Track combination usage
    const combinationKey = `${project.id}-${subproject.id}`;
    setCombinationUsageCount(prev => ({
      ...prev,
      [combinationKey]: (prev[combinationKey] || 0) + 1
    }));
    
    // Select project and subproject, then start timer
      handleProjectSelect(project.id);
      handleSubprojectSelect(subproject.id);
      if (typeof handleStartNewTimerForProject === 'function') {
        setTimeout(() => { handleStartNewTimerForProject(project.id, subproject.id); }, 100);
      } else if (stopwatchRef && stopwatchRef.current && typeof stopwatchRef.current.handleStart === 'function') {
        setTimeout(() => { stopwatchRef.current?.handleStart(); }, 100);
      }
  }, [handleProjectSelect, handleSubprojectSelect, stopwatchRef, handleStartNewTimerForProject]);

  // Global search results - combines projects and subprojects
  const globalSearchResults = React.useMemo(() => {
    if (!globalSearch.trim()) return [];
    
    const searchTerm = globalSearch.toLowerCase();
    const results: Array<{
      type: 'project' | 'subproject';
      project: Project;
      subproject?: Subproject;
      displayName: string;
      id: string;
    }> = [];
    
    // Search projects
    allProjects.forEach(project => {
      if (project.name.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'project',
          project,
          displayName: project.name,
          id: project.id
        });
      }
      
      // Search subprojects within this project
      project.subprojects.forEach(subproject => {
        if (subproject.name.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'subproject',
            project,
            subproject,
            displayName: `${project.name} > ${subproject.name}`,
            id: `${project.id}-${subproject.id}`
          });
        }
      });
    });
    
    return results.slice(0, 10); // Limit to 10 results
  }, [allProjects, globalSearch]);

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
  const globalSearchInputRef = useRef<HTMLInputElement>(null);

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
        setGlobalSearch('');
        setShowGlobalDropdown(false);
        globalSearchInputRef.current?.focus();
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isTimerRunning, focusedInput]);

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




  // Simplified quick start click handler
  const handleQuickStartClick = (project: Project, subproject: Subproject) => {
      if (typeof handleStartNewTimerForProject === 'function') {
      // Select the project and subproject
        onProjectSelect(project.id);
        onSubprojectSelect(subproject.id);
        handleStartNewTimerForProject(project.id, subproject.id);
      }
  };

  // Global search handlers
  const handleGlobalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalSearch(value);
    setShowGlobalDropdown(value.length > 0);
    setGlobalDropdownIndex(-1);
  };

  const handleGlobalSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showGlobalDropdown) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setGlobalDropdownIndex(prev => {
        const newIndex = prev < 0 ? 0 : prev + 1;
        return newIndex < globalSearchResults.length ? newIndex : prev;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setGlobalDropdownIndex(prev => {
        const newIndex = prev <= 0 ? 0 : prev - 1;
        return newIndex;
      });
    } else if ((e.key === 'Enter' || e.key === 'Tab') && globalDropdownIndex >= 0) {
      const result = globalSearchResults[globalDropdownIndex];
      if (result) {
        if (result.type === 'project') {
          onProjectSelect(result.project.id);
        } else if (result.type === 'subproject' && result.subproject) {
          onProjectSelect(result.project.id);
          onSubprojectSelect(result.subproject.id);
        }
        setGlobalSearch('');
        setShowGlobalDropdown(false);
        setGlobalDropdownIndex(-1);
      }
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setShowGlobalDropdown(false);
      setGlobalDropdownIndex(-1);
    }
  };

  const handleGlobalSearchResultClick = (result: typeof globalSearchResults[0]) => {
    if (result.type === 'project') {
      onProjectSelect(result.project.id);
    } else if (result.type === 'subproject' && result.subproject) {
      onProjectSelect(result.project.id);
      onSubprojectSelect(result.subproject.id);
    }
    setGlobalSearch('');
    setShowGlobalDropdown(false);
    setGlobalDropdownIndex(-1);
  };

  useImperativeHandle(ref, () => ({
    focusProjectSearch: () => {
      globalSearchInputRef.current?.focus();
    },
    focusSubprojectSearch: () => {
      globalSearchInputRef.current?.focus();
    },
    selectProject: (direction: 'up' | 'down') => {
      // This is handled by the global search keydown handlers
    },
    selectSubproject: (direction: 'up' | 'down') => {
      // This is handled by the global search keydown handlers
    },
    confirmProjectSelection: () => {
      if (showGlobalDropdown && globalDropdownIndex >= 0) {
        const result = globalSearchResults[globalDropdownIndex];
        if (result) {
          handleGlobalSearchResultClick(result);
        }
      }
    },
    confirmSubprojectSelection: () => {
      if (showGlobalDropdown && globalDropdownIndex >= 0) {
        const result = globalSearchResults[globalDropdownIndex];
        if (result) {
          handleGlobalSearchResultClick(result);
        }
      }
    },
    clearSelection: () => {
      setGlobalSearch('');
      setShowGlobalDropdown(false);
    }
  }));

  // Apple-inspired unified container with animated header and 3x2 squircle grid
  const [headerFade, setHeaderFade] = useState(true);
  useEffect(() => {
    setHeaderFade(false);
    const timeout = setTimeout(() => setHeaderFade(true), 150);
    return () => clearTimeout(timeout);
  }, [selectedProjectId]);

  // Always show projects in the projects tab - fallback to allProjects, then demoProjects if needed
  let topGridItems = (frequentProjects.length > 0 ? frequentProjects : allProjects).slice(0, 6);
  if (topGridItems.length < 6) {
    // Fill with demo projects if not enough
    const needed = 6 - topGridItems.length;
    topGridItems = topGridItems.concat(demoProjects.slice(0, needed));
  }
  const bottomGridItems = frequentCombinations;

  const [leftTab, setLeftTab] = useState<'projects' | 'quickstart'>('projects');
  const [currentView, setCurrentView] = useState<'projects' | 'subprojects'>('projects');

  // Add ref for search wrapper
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Add effect for outside click to close dropdown
  useEffect(() => {
    if (!showGlobalDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setShowGlobalDropdown(false);
        setIsSearchFocused(false);
        setDropdownMode('projects');
        setSelectedDropdownProject(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGlobalDropdown]);

  // Helper to get a visible dropdown color
  function getDropdownColor(color: string) {
    const tc = tinycolor2(color);
    if (tc.isLight()) {
      return tc.darken(10).toString();
    } else {
      return tc.brighten(20).toString();
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full h-full">
      {/* Global Search Bar */}
      <div className="relative w-full pt-4 pb-3">
        <div ref={searchWrapperRef} className="relative w-full search-wrapper" style={{ width: '100%', marginBottom: 0 }}>
          <input
            ref={globalSearchInputRef}
            type="text"
            className="search-input"
            placeholder="Search for projects and subprojects..."
            autoComplete="off"
            spellCheck="false"
            value={globalSearch}
            onChange={handleGlobalSearchChange}
            onFocus={() => { setShowGlobalDropdown(true); setIsSearchFocused(true); setDropdownMode('projects'); setSelectedDropdownProject(null); }}
            onBlur={() => setIsSearchFocused(false)}
            onKeyDown={handleGlobalSearchKeyDown}
            style={{
              width: '100%',
              height: '60px',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              padding: '0 24px 0 60px',
              fontSize: '16px',
              fontWeight: 400,
              color: '#1d1d1f',
              outline: 'none',
              transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
              boxShadow: isSearchFocused
                ? '0 8px 32px 0 rgba(66,133,244,0.18), 0 0 0 3px rgba(66,133,244,0.18)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              borderColor: isSearchFocused ? '#4285F4' : 'rgba(255,255,255,0.2)',
            }}
          />
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: `translateY(-50%) scale(${isSearchFocused ? 1.18 : 1})`,
              width: 20,
              height: 20,
              opacity: 0.6,
              pointerEvents: 'none',
              transition: 'transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.2s',
              color: isSearchFocused ? '#4285F4' : undefined,
            }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          {/* Global Search Dropdown */}
          {showGlobalDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
              {dropdownMode === 'projects' && (
                <>
                  {allProjects
                    .filter(project => project.name.toLowerCase().includes(globalSearch.toLowerCase()))
                    .map((project, index) => (
                      <button
                        key={project.id}
                        className={`dropdown-anim-item w-full px-4 py-3 text-left flex items-center gap-3 ${index === globalDropdownIndex ? 'bg-gray-100' : ''} ${index === 0 ? 'rounded-t-xl' : ''} ${index === allProjects.length - 1 ? 'rounded-b-xl' : ''}`}
                        style={{
                          ['--dropdown-border-color' as any]: colorCodedProjectsEnabled ? getDropdownColor(generateProjectColor(project.name)) : '#222',
                        }}
                        onClick={() => {
                          setDropdownMode('subprojects');
                          setSelectedDropdownProject(project);
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: colorCodedProjectsEnabled ? getDropdownColor(generateProjectColor(project.name)) : '#222' }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{project.name}</div>
                        </div>
                        <div className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">Project</div>
                      </button>
                    ))}
                  {allProjects.filter(project => project.name.toLowerCase().includes(globalSearch.toLowerCase())).length === 0 && (
                    <div className="px-4 py-6 text-gray-500 text-sm text-center">No projects found</div>
                  )}
                </>
              )}
              {dropdownMode === 'subprojects' && selectedDropdownProject && (
                <>
                  <div className="flex items-center px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <button
                      className="mr-2 p-1.5 hover:bg-gray-200 rounded transition-colors"
                      onClick={() => { setDropdownMode('projects'); setSelectedDropdownProject(null); }}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="font-medium text-gray-700">{selectedDropdownProject.name}</span>
                  </div>
                  {selectedDropdownProject.subprojects
                    .filter(sub => sub.name.toLowerCase().includes(globalSearch.toLowerCase()))
                    .map((subproject, index) => (
                      <button
                        key={subproject.id}
                        className={`dropdown-anim-item w-full px-4 py-3 text-left flex items-center gap-3 ${index === 0 ? 'rounded-t-none' : ''} ${index === selectedDropdownProject.subprojects.length - 1 ? 'rounded-b-xl' : ''}`}
                        style={{
                          ['--dropdown-border-color' as any]: colorCodedProjectsEnabled ? getDropdownColor(generateProjectColor(selectedDropdownProject.name)) : '#222',
                        }}
                        onClick={() => {
                          onSubprojectSelect(subproject.id);
                          setShowGlobalDropdown(false);
                          setIsSearchFocused(false);
                          setDropdownMode('projects');
                          setSelectedDropdownProject(null);
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: colorCodedProjectsEnabled ? getDropdownColor(generateProjectColor(selectedDropdownProject.name)) : '#222' }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{subproject.name}</div>
                        </div>
                        <div className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">Subproject</div>
                      </button>
                    ))}
                  {selectedDropdownProject.subprojects.filter(sub => sub.name.toLowerCase().includes(globalSearch.toLowerCase())).length === 0 && (
                    <div className="px-4 py-6 text-gray-500 text-sm text-center">No subprojects found</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Unified Tab + Grid Panel */}
      <div className="w-full max-w-full mx-auto rounded-2xl shadow-xl bg-white/95 border border-gray-200 flex flex-col flex-1 min-h-0 h-full">
        {/* Tab Navigation */}
        <div className="flex mx-0 mb-0 bg-transparent rounded-t-2xl overflow-hidden">
          <button
            className={`flex-1 py-3 px-4 font-semibold text-sm transition-all duration-200 border-0 outline-none
              ${leftTab === 'projects'
                ? 'bg-white text-gray-900 shadow-none rounded-t-2xl rounded-b-none z-10'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900 shadow-sm rounded-2xl z-0'}
            `}
            style={{ borderBottom: leftTab === 'projects' ? '2px solid #fff' : '2px solid #e5e7eb' }}
            onClick={() => setLeftTab('projects')}
          >
            Frequently Used Projects
          </button>
          <button
            className={`flex-1 py-3 px-4 font-semibold text-sm transition-all duration-200 border-0 outline-none
              ${leftTab === 'quickstart'
                ? 'bg-white text-gray-900 shadow-none rounded-t-2xl rounded-b-none z-10'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900 shadow-sm rounded-2xl z-0'}
            `}
            style={{ borderBottom: leftTab === 'quickstart' ? '2px solid #fff' : '2px solid #e5e7eb' }}
            onClick={() => setLeftTab('quickstart')}
          >
            Quick Start
          </button>
        </div>
        {/* Content Area (Button Grid) */}
        <div className="flex-1 w-full px-4 pb-4 pt-0">
          {leftTab === 'projects' && (
            <div className="w-full h-full bg-white rounded-b-2xl border-0 shadow-none overflow-hidden relative">
              {/* Header with back button when showing subprojects - positioned as overlay */}
              {currentView === 'subprojects' && selectedProject && (
                <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                  <div className="flex items-center gap-3 p-3">
                    <button
                      onClick={() => setCurrentView('projects')}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{selectedProject.name}</h3>
                      <p className="text-xs text-gray-500">Subprojects</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`grid grid-cols-2 gap-3 p-4 h-full overflow-y-auto ${currentView === 'subprojects' ? '' : 'rounded-2xl'}`}>
                {currentView === 'projects' ? (
                  // Show projects
                  <>
                    {topGridItems.length === 0 && 
                      Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-full h-full bg-gray-50 rounded-xl border border-gray-100 min-h-[64px]" />
                      ))
                    }
                    {topGridItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                    onProjectSelect(item.id);
                          // Navigate to subprojects view for this project
                          setCurrentView('subprojects');
              }}
                      className="w-full h-full block bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-md transition-all duration-200 hover:from-gray-100 hover:to-gray-200 hover:shadow-lg active:shadow-inner active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
              style={{
                background: colorCodedProjectsEnabled
                  ? (() => {
                              const base = item.name
                          ? generateProjectColor(item.name)
                                : '#4285F4';
                              return `linear-gradient(135deg, ${base} 0%, ${tinycolor2(base).darken(10).toString()} 100%)`;
                            })()
                          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                      }}
                    >
                      <div className="h-full w-full flex items-center justify-center px-3">
                        <span 
                          className="font-semibold text-lg text-center leading-tight"
                          style={{
                color: colorCodedProjectsEnabled
                  ? (() => {
                                  const base = item.name
                          ? generateProjectColor(item.name)
                                    : '#4285F4';
                                  return tinycolor2(base).isLight() ? '#1e293b' : '#ffffff';
                                })()
                              : '#1e293b'
                          }}
                        >
                          {item.name}
                        </span>
                      </div>
              </button>
            ))}
                  </>
                ) : (
                  // Show subprojects
                  <>
                    {selectedProject?.subprojects.length === 0 && 
                      Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-full h-full bg-gray-50 rounded-xl border border-gray-100 min-h-[64px]" />
                      ))
                    }
                    {selectedProject?.subprojects.slice(0, 6).map((subproject) => (
                      <button
                        key={subproject.id}
                        onClick={() => onSubprojectSelect(subproject.id)}
                        className="w-full h-full block bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40"
                        style={{
                          background: colorCodedProjectsEnabled
                            ? (() => {
                                const base = selectedProject.name
                                  ? generateProjectColor(selectedProject.name)
                                : '#4285F4';
                              return `linear-gradient(135deg, ${base} 0%, ${tinycolor2(base).darken(10).toString()} 100%)`;
                            })()
                          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                      }}
                    >
                      <div className="h-full flex items-center justify-center px-3">
                        <span 
                          className="font-semibold text-lg text-center leading-tight"
                          style={{
                            color: colorCodedProjectsEnabled
                              ? (() => {
                                  const base = selectedProject.name
                                    ? generateProjectColor(selectedProject.name)
                                    : '#4285F4';
                                  return tinycolor2(base).isLight() ? '#1e293b' : '#ffffff';
                                })()
                              : '#1e293b'
                          }}
                        >
                          {subproject.name}
                        </span>
                      </div>
                    </button>
                  ))}
                  </>
                )}
              </div>
            </div>
          )}

          {leftTab === 'quickstart' && (
            <div className="w-full h-full bg-white rounded-b-2xl border-0 shadow-none overflow-hidden">
              <div className="grid grid-cols-2 gap-3 p-4 h-full">
                {bottomGridItems.length === 0 && 
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-full h-full bg-gray-50 rounded-xl border border-gray-100 min-h-[64px]" />
                  ))
                }
                {bottomGridItems.map((item) => {
                  const isRunning = isTimerRunning && selectedProjectId === item.project.id && selectedSubprojectId === item.subproject.id;
                  const key = `${item.project.id}-${item.subproject.id}`;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => handleQuickStartClick(item.project, item.subproject)}
                      className="w-full h-full block bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40"
                      style={{
                        background: isRunning
                          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
              : colorCodedProjectsEnabled
                ? (() => {
                    const base = item.project && item.project.name
                      ? generateProjectColor(item.project.name)
                                : '#4285F4';
                              return `linear-gradient(135deg, ${base} 0%, ${tinycolor2(base).darken(10).toString()} 100%)`;
                            })()
                          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                    }}
                  >
                    <div className="h-full flex flex-col items-center justify-center px-2">
                      <span 
                        className="font-semibold text-xs text-center leading-tight mb-1"
                        style={{
                          color: isRunning
                            ? '#ffffff'
              : colorCodedProjectsEnabled
                ? (() => {
                    const base = item.project && item.project.name
                      ? generateProjectColor(item.project.name)
                                    : '#4285F4';
                                  return tinycolor2(base).isLight() ? '#1e293b' : '#ffffff';
                                })()
                              : '#1e293b'
                        }}
                      >
                        {item.project.name}
                      </span>
                      <span 
                        className="text-xs text-center leading-tight opacity-80"
                    style={{
                          color: isRunning
                            ? '#e2e8f0'
                            : colorCodedProjectsEnabled
                              ? (() => {
                                  const base = item.project && item.project.name
                                    ? generateProjectColor(item.project.name)
                                    : '#4285F4';
                                  return tinycolor2(base).isLight() ? '#475569' : '#e2e8f0';
                                })()
                              : '#64748b'
                        }}
                      >
                        {item.subproject.name}
                    </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
});

ProjectSelector.displayName = 'ProjectSelector';

export default ProjectSelector;
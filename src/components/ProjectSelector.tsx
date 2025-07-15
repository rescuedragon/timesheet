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

  return (
    <div className="w-full h-full flex flex-col">
      {/* Global Search Bar */}
      <div className="relative px-4 pt-4 pb-3">
        <input
          ref={globalSearchInputRef}
          type="text"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
          placeholder="Search for projects and subprojects..."
          value={globalSearch}
          onChange={handleGlobalSearchChange}
          onKeyDown={handleGlobalSearchKeyDown}
          onFocus={() => {
            setFocusedInput('project');
            globalSearch.length > 0 && setShowGlobalDropdown(true);
          }}
          onBlur={() => {
            setFocusedInput(null);
            setTimeout(() => setShowGlobalDropdown(false), 200);
          }}
        />
        
        {/* Global Search Dropdown */}
        {showGlobalDropdown && globalSearchResults.length > 0 && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
            {globalSearchResults.map((result, index) => (
              <button
                key={result.id}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  index === globalDropdownIndex ? 'bg-gray-100' : ''
                } ${index === 0 ? 'rounded-t-xl' : ''} ${index === globalSearchResults.length - 1 ? 'rounded-b-xl' : ''}`}
                onClick={() => handleGlobalSearchResultClick(result)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    result.type === 'project' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {result.type === 'project' ? result.project.name : result.subproject?.name}
                    </div>
                    {result.type === 'subproject' && (
                      <div className="text-sm text-gray-500">
                        {result.project.name}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
                    {result.type === 'project' ? 'Project' : 'Subproject'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex mx-4 mb-4 bg-gray-100 rounded-xl p-1">
        <button
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
            leftTab === 'projects' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setLeftTab('projects')}
        >
          Frequently Used Projects
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
            leftTab === 'quickstart' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setLeftTab('quickstart')}
        >
          Quick Start
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-4 pb-4">
        {leftTab === 'projects' && (
          <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
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
            
            <div className={`grid grid-cols-2 gap-3 p-4 h-full overflow-y-auto`}>
              {currentView === 'projects' ? (
                // Show projects
                <>
                  {topGridItems.length === 0 && 
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-30 bg-gray-50 rounded-xl border border-gray-100" />
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
                      className="h-30 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                      <div className="h-full flex items-center justify-center px-3">
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
                      <div key={i} className="h-25 bg-gray-50 rounded-xl border border-gray-100" />
                    ))
                  }
                  {selectedProject?.subprojects.slice(0, 6).map((subproject) => (
                    <button
                      key={subproject.id}
                      onClick={() => onSubprojectSelect(subproject.id)}
                      className="h-25 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40"
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
          <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 gap-3 p-4 h-full">
              {bottomGridItems.length === 0 && 
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-50 rounded-xl border border-gray-100" />
                ))
              }
              {bottomGridItems.map((item) => {
                const isRunning = isTimerRunning && selectedProjectId === item.project.id && selectedSubprojectId === item.subproject.id;
                const key = `${item.project.id}-${item.subproject.id}`;
                
                return (
                  <button
                    key={key}
                    onClick={() => handleQuickStartClick(item.project, item.subproject)}
                    className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40"
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
  );
});

ProjectSelector.displayName = 'ProjectSelector';

export default ProjectSelector;
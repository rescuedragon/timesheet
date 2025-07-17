import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef, CSSProperties } from 'react';
import ReactDOM from 'react-dom';
import { Search, ChevronLeft, Edit3, Pin, PinOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePinnedProjects } from '@/hooks/usePinnedProjects';
import { useSettings } from '@/hooks/useSettings';
import { generateProjectColor } from '../lib/projectColors';
import { storageService } from '@/services/storageService';
import EditQuickStartDialog from './project-selector/EditQuickStartDialog';
import './project-selector/ProjectSelector.css';

// ========== Interfaces ==========
interface Subproject {
  id: string;
  name: string;
  totalTime: number;
}
interface Project {
  id: string;
  name: string;
  subprojects: Subproject[];
  totalTime: number;
}

interface CardProps {
  title: string;
  subtitle?: string;
  color: string;
  onClick: () => void;
  isColorCoded: boolean;
}

interface ProjectSelectorProps {
  projects: Project[];
  onProjectSelect: (projectId: string) => void;
  onSubprojectSelect: (subprojectId: string) => void;
  onStartTimer?: (projectId: string, subprojectId: string) => void;
}

export interface ProjectSelectorRef {
  clearSelection: () => void;
}

// ========== Reusable Card Component ==========
const Card = React.memo<CardProps>(({ title, subtitle, color, onClick, isColorCoded }) => {
    // Generate project category and color
    const getProjectCategory = (projectTitle: string) => {
        const lowerTitle = projectTitle.toLowerCase();
        if (lowerTitle.includes('website') || lowerTitle.includes('web') || lowerTitle.includes('development') || lowerTitle.includes('dev')) {
            return { name: 'Development', color: '#3B82F6', bgColor: '#DBEAFE' };
        }
        if (lowerTitle.includes('marketing') || lowerTitle.includes('campaign')) {
            return { name: 'Marketing', color: '#10B981', bgColor: '#D1FAE5' };
        }
        if (lowerTitle.includes('data') || lowerTitle.includes('analytics')) {
            return { name: 'Analytics', color: '#8B5CF6', bgColor: '#EDE9FE' };
        }
        if (lowerTitle.includes('e-commerce') || lowerTitle.includes('store')) {
            return { name: 'E-commerce', color: '#F59E0B', bgColor: '#FEF3C7' };
        }
        if (lowerTitle.includes('hr') || lowerTitle.includes('onboarding')) {
            return { name: 'HR', color: '#EF4444', bgColor: '#FEE2E2' };
        }
        if (lowerTitle.includes('design') || lowerTitle.includes('ui')) {
            return { name: 'Design', color: '#EC4899', bgColor: '#FCE7F3' };
        }
        return { name: 'General', color: '#6B7280', bgColor: '#F3F4F6' };
    };

    const category = getProjectCategory(title);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="relative group rounded-2xl p-6 cursor-pointer transition-all duration-300 ease-in-out shadow-sm hover:shadow-xl hover:-translate-y-4 w-full"
            style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minHeight: '120px',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}
            onClick={onClick}
            onMouseEnter={(e) => {
                const line = e.currentTarget.querySelector('.purple-line') as HTMLElement;
                if (line) line.style.transform = 'scaleX(1)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 40px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
                const line = e.currentTarget.querySelector('.purple-line') as HTMLElement;
                if (line) line.style.transform = 'scaleX(0)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            }}
        >
            <div 
                className="purple-line absolute top-0 left-0 right-0 h-1 transition-transform duration-300 ease-in-out"
                style={{
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left'
                }}
            />
            <div className="flex flex-col items-center justify-center h-full">
                <h4 className="text-lg font-semibold text-center mb-2" style={{ color: '#1d1d1f' }}>{title}</h4>
                {subtitle && <p className="text-sm text-center" style={{ color: '#6b7280', lineHeight: '1.4' }}>{subtitle}</p>}
            </div>
        </motion.div>
    );
});

// ========== Timer-Aware Card Component ==========
interface TimerCardProps {
  title: string;
  subtitle?: string;
  color: string;
  onClick: () => void;
  isColorCoded: boolean;
  isRunning: boolean;
  projectId: string;
  subprojectId: string;
}

const TimerCard = React.memo<TimerCardProps>(({ title, subtitle, color, onClick, isColorCoded, isRunning, projectId, subprojectId }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative group rounded-2xl p-6 cursor-pointer transition-all duration-300 ease-in-out shadow-sm hover:shadow-xl hover:-translate-y-4 w-full"
      style={{ 
        background: isRunning ? '#6366f1' : 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        minHeight: '120px',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isRunning ? '0 8px 32px rgba(99, 102, 241, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isRunning) {
          const line = e.currentTarget.querySelector('.purple-line') as HTMLElement;
          if (line) line.style.transform = 'scaleX(1)';
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 40px rgba(0, 0, 0, 0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isRunning) {
          const line = e.currentTarget.querySelector('.purple-line') as HTMLElement;
          if (line) line.style.transform = 'scaleX(0)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        }
      }}
    >
      <div 
        className="purple-line absolute top-0 left-0 right-0 h-1 transition-transform duration-300 ease-in-out"
        style={{
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          transform: 'scaleX(0)',
          transformOrigin: 'left'
        }}
      />
      
      {/* Vibrating Stopwatch Icon */}
      {isRunning && (
        <div className="absolute top-3 right-3">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </motion.div>
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center h-full">
        <h4 
          className="text-lg font-semibold text-center mb-2" 
          style={{ color: isRunning ? '#ffffff' : '#1d1d1f' }}
        >
          {title}
        </h4>
        {subtitle && (
          <p 
            className="text-sm text-center" 
            style={{ color: isRunning ? 'rgba(255, 255, 255, 0.8)' : '#6b7280', lineHeight: '1.4' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
});

// ========== Main Component ==========
const ProjectSelector = forwardRef<ProjectSelectorRef, ProjectSelectorProps>(({
  projects,
  onProjectSelect,
  onSubprojectSelect,
  onStartTimer,
}, ref) => {
  // State for new dropdown
  const [searchValue, setSearchValue] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownView, setDropdownView] = useState('projects');
  const [activeProject, setActiveProject] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [flyoutStyle, setFlyoutStyle] = useState<CSSProperties>({ opacity: 0, pointerEvents: 'none' });
  const searchContainerRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [runningProject, setRunningProject] = useState<{projectId: string, subprojectId: string} | null>(null);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('frequent');
  const [view, setView] = useState('projects');
  const [selectedProjectForSubprojects, setSelectedProjectForSubprojects] = useState(null);
  const [frequentProjects, setFrequentProjects] = useState([]);
  const [projectUsageCount, setProjectUsageCount] = useState({});

  const { colorCodedProjectsEnabled } = useSettings();
  const { pinned, togglePin, isPinned, pinnedProjects, setAllPinnedProjects, setAllPinnedCombinations } = usePinnedProjects();
  
  // Combine projects with a demo fallback
  const allProjects = projects.length > 0 ? projects : Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Project ${i + 1}`,
    subprojects: Array.from({ length: 3 }, (_, j) => ({ id: `${i + 1}-${j + 1}`, name: `Subproject ${j + 1}` })),
  }));

  // Check timer state on mount and when timer state changes
  useEffect(() => {
    const checkTimerState = () => {
      const stopwatchState = storageService.getStopwatchState();
      const isRunning = stopwatchState?.isRunning || false;
      setIsTimerRunning(isRunning);
      
      if (isRunning && stopwatchState?.projectId && stopwatchState?.subprojectId) {
        setRunningProject({
          projectId: stopwatchState.projectId,
          subprojectId: stopwatchState.subprojectId
        });
      } else {
        setRunningProject(null);
      }
    };

    checkTimerState();
    
    // Listen for timer state changes
    const handleTimerStateChange = () => {
      checkTimerState();
    };

    window.addEventListener('timer-state-changed', handleTimerStateChange);
    window.addEventListener('timer-started', handleTimerStateChange);
    window.addEventListener('timer-stopped', handleTimerStateChange);

    return () => {
      window.removeEventListener('timer-state-changed', handleTimerStateChange);
      window.removeEventListener('timer-started', handleTimerStateChange);
      window.removeEventListener('timer-stopped', handleTimerStateChange);
    };
  }, []);

  // Logic for frequent projects
  useEffect(() => {
    const sorted = [...allProjects].sort((a, b) => (projectUsageCount[b.id] || 0) - (projectUsageCount[a.id] || 0)).slice(0, 6);
    setFrequentProjects(sorted);
  }, [allProjects, projectUsageCount]);

  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      setSearchValue('');
      setActiveProject(null);
    }
  }));

  const handleSelection = (project, subproject) => {
    onProjectSelect(project.id);
    onSubprojectSelect(subproject.id);
    setSearchValue(`${project.name} > ${subproject.name}`);
    setDropdownOpen(false);
    setProjectUsageCount(prev => ({ ...prev, [project.id]: (prev[project.id] || 0) + 1 }));
    
    // Start the timer if onStartTimer is provided (for Quick Start buttons)
    if (onStartTimer) {
      onStartTimer(project.id, subproject.id);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProjectForSubprojects(project);
    setView('subprojects');
  };

  const handleSubprojectSelect = (project, subproject) => {
    onProjectSelect(project.id);
    onSubprojectSelect(subproject.id);
    setSearchValue(`${project.name} > ${subproject.name}`);
    setProjectUsageCount(prev => ({ ...prev, [project.id]: (prev[project.id] || 0) + 1 }));
    // Don't start the timer - just select the project and subproject
  };

  const handleBackToProjects = () => {
    setView('projects');
    setSelectedProjectForSubprojects(null);
  };

  const handleSearchBarClick = () => {
    if (!isTimerRunning) {
      // Reset project and subproject selection
      onProjectSelect('');
      onSubprojectSelect('');
      setSearchValue('');
      setActiveProject(null);
      setDropdownView('projects');
      setSelectedIndex(0);
      setDropdownOpen(true);
    }
    // If timer is running, do nothing (search bar is effectively disabled)
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
    setDropdownView('projects');
    setActiveProject(null);
    setHoveredProject(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (hoveredProject && dropdownRef.current) {
        const scrollContainer = dropdownRef.current.querySelector('.dropdown-ps-scroll');
        const hoveredItem = dropdownRef.current.querySelector(`[data-project-id='${hoveredProject.id}']`);

        if (hoveredItem && scrollContainer) {
            const itemRect = hoveredItem.getBoundingClientRect();
            const dropdownRect = dropdownRef.current.getBoundingClientRect();

            setFlyoutStyle({
                position: 'fixed',
                top: `${itemRect.top}px`,
                left: `${dropdownRect.right + 8}px`,
                opacity: 1,
                pointerEvents: 'auto',
                transition: 'opacity 0.2s ease-out',
                zIndex: 9999,
            });
          }
        } else {
        setFlyoutStyle({ opacity: 0, pointerEvents: 'none' });
    }
  }, [hoveredProject]);

  const startHideTimer = () => {
    hoverTimeoutRef.current = setTimeout(() => {
        setHoveredProject(null);
    }, 300);
  };

  const cancelHideTimer = () => {
    if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleProjectHover = (project) => {
    cancelHideTimer();
    setHoveredProject(project);
    setSelectedIndex(filteredProjects.findIndex(p => p.id === project.id));
  };

  const handleProjectLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredProject(null);
    }, 300);
  };

  const filteredProjects = allProjects.filter(p => p.name.toLowerCase().includes(searchValue.toLowerCase()));

  const handleKeyDown = (event) => {
    if (!isDropdownOpen) return;
    
    const currentItems = dropdownView === 'projects' ? filteredProjects : (activeProject?.subprojects || []);
    
    switch(event.key) {
      case 'Escape':
        closeDropdown();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, currentItems.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (dropdownView === 'projects' && currentItems[selectedIndex]) {
          const project = currentItems[selectedIndex];
          setActiveProject(project);
          setDropdownView('subprojects');
          setSelectedIndex(0);
          setHoveredProject(null);
        } else if (dropdownView === 'subprojects' && currentItems[selectedIndex]) {
          const subproject = currentItems[selectedIndex];
          handleSelection(activeProject, subproject);
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen, dropdownView, filteredProjects, activeProject, selectedIndex]);

  // Auto-scroll to keep selected item visible
  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector('.dropdown-ps-item.selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({ 
          block: 'nearest', 
          behavior: 'smooth' 
        });
      }
    }
  }, [selectedIndex, isDropdownOpen]);

  // Show dropdown when focused or when there are filtered results
  const shouldShowDropdown = isDropdownOpen && (filteredProjects.length > 0 || dropdownView === 'subprojects');

  const pinnedCombinations = pinned.map(({ projectId, subprojectId }) => {
      const project = allProjects.find(p => p.id === projectId);
      const subproject = project?.subprojects.find(s => s.id === subprojectId);
      return { project, subproject };
  }).filter(item => item.project && item.subproject);

  // Calculate optimal columns based on number of items
  const getOptimalColumns = (itemCount: number) => {
    if (itemCount <= 2) return itemCount;
    if (itemCount <= 4) return 2;
    if (itemCount <= 6) return 3;
    if (itemCount <= 9) return 3;
    if (itemCount <= 12) return 4;
    return Math.min(5, Math.ceil(itemCount / 3));
  };

  const handleSaveQuickStart = (combinations: Array<{projectId: string, subprojectId: string}>) => {
    // Use the new function to set all combinations at once
    setAllPinnedCombinations(combinations);
  };

  return (
    <div className="p-4 rounded-lg flex flex-col h-full overflow-hidden" style={{ 
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      maxWidth: '100%'
    }}>
      {/* Search and Tabs */}
      <div className="mb-4 relative">
        <div ref={searchContainerRef} className="search-container-ps">
          <div className="search-input-wrapper-ps flex items-center">
            <div className="flex-grow relative">
              <input
                type="text"
                className={`search-input-ps ${isTimerRunning ? 'cursor-not-allowed bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'cursor-text'}`}
                placeholder={isTimerRunning ? "Timer is running..." : "Search projects..."}
                value={searchValue}
                onChange={(e) => {
                    if (!isTimerRunning) {
                        setSearchValue(e.target.value);
                        setDropdownOpen(true);
                        setDropdownView('projects');
                    }
                }}
                onFocus={() => {
                    if (!isTimerRunning) {
                        setDropdownOpen(true);
                    }
                }}
                onClick={handleSearchBarClick}
                disabled={isTimerRunning}
                style={{
                  ...(isTimerRunning && {
                    background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
                    borderColor: '#6366f1',
                    color: '#4338ca',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
                    fontWeight: '500'
                  })
                }}
              />
              <Search className={`search-icon-ps ${isTimerRunning ? 'text-indigo-500' : ''}`} />
            </div>
            <div className="flex items-center ml-2 mr-2">
              <button
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'frequent' 
                    ? 'bg-indigo-500 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
                onClick={() => setActiveTab('frequent')}
              >
                Frequently Used
              </button>
              <button
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'quick-start' 
                    ? 'bg-indigo-500 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
                onClick={() => setActiveTab('quick-start')}
              >
                Quick Start
              </button>
            </div>
          </div>
          
          {/* Dropdown - Within Container */}
          <AnimatePresence>
            {shouldShowDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`dropdown-ps ${shouldShowDropdown ? 'show' : ''}`}
                ref={dropdownRef}
                style={{ 
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  width: '100%'
                }}
              >
                {dropdownView === 'projects' ? (
                  <div className="dropdown-ps-scroll">
                    {filteredProjects.map((project, index) => (
                      <div
                        key={project.id}
                        className={`dropdown-ps-item ${selectedIndex === index ? 'selected' : ''}`}
                        onClick={() => {
                          setActiveProject(project);
                          setDropdownView('subprojects');
                          setSelectedIndex(0);
                        }}
                        onMouseEnter={() => handleProjectHover(project)}
                        onMouseLeave={handleProjectLeave}
                        data-project-id={project.id}
                      >
                        <div className="item-content-ps">
                          <div className="item-text-ps">{project.name}</div>
                          <div className="item-description-ps">
                            {project.subprojects.length} subprojects
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dropdown-ps-scroll">
                    {activeProject?.subprojects.map((subproject, index) => (
                      <div
                        key={subproject.id}
                        className={`dropdown-ps-item ${selectedIndex === index ? 'selected' : ''}`}
                        onClick={() => handleSelection(activeProject, subproject)}
                      >
                        <div className="item-content-ps">
                          <div className="item-text-ps">{subproject.name}</div>
                          <div className="item-description-ps">
                            {activeProject.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'frequent' && (
            <motion.div
              key="frequent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {view === 'projects' ? (
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))` }}>
                  {frequentProjects.map(project => (
                    <Card
                      key={project.id}
                      title={project.name}
                      onClick={() => handleProjectClick(project)}
                      isColorCoded={colorCodedProjectsEnabled}
                      color={generateProjectColor(project.name)}
                    />
                  ))}
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-6">
                    <button
                      onClick={handleBackToProjects}
                      className="flex items-center gap-2 px-4 py-2 text-base font-medium transition-all duration-300 rounded-xl text-indigo-500 hover:bg-indigo-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Projects
                    </button>
                  </div>
                  <h3 className="text-2xl font-bold mb-6" style={{ color: '#1d1d1f' }}>
                    {selectedProjectForSubprojects?.name}
                  </h3>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))` }}>
                    {selectedProjectForSubprojects?.subprojects.map(subproject => (
                      <Card
                        key={subproject.id}
                        title={subproject.name}
                        onClick={() => handleSubprojectSelect(selectedProjectForSubprojects, subproject)}
                        isColorCoded={colorCodedProjectsEnabled}
                        color={generateProjectColor(selectedProjectForSubprojects.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'quick-start' && (
            <motion.div
              key="quick-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Quick Start Projects</h3>
                <button onClick={() => setIsEditDialogOpen(true)} className="text-indigo-500 hover:text-indigo-700">Edit</button>
              </div>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))` }}
              >
                {pinnedCombinations.map(({ project, subproject }) => {
                  const isCurrentlyRunning = runningProject && 
                    runningProject.projectId === project.id && 
                    runningProject.subprojectId === subproject.id;
                  
                  return (
                    <TimerCard
                      key={`${project.id}-${subproject.id}`}
                      title={project.name}
                      subtitle={subproject.name}
                      onClick={() => handleSelection(project, subproject)}
                      isColorCoded={colorCodedProjectsEnabled}
                      color={generateProjectColor(project.name)}
                      isRunning={isCurrentlyRunning}
                      projectId={project.id}
                      subprojectId={subproject.id}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <EditQuickStartDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        projects={allProjects}
        pinnedCombinations={pinned}
        onSave={handleSaveQuickStart}
      />

      {/* Flyout for subprojects */}
      {ReactDOM.createPortal(
        <AnimatePresence>
          {hoveredProject && dropdownView === 'projects' && (
            <div
              className="flyout-ps"
              style={flyoutStyle}
              onMouseEnter={cancelHideTimer}
              onMouseLeave={startHideTimer}
            >
              <div className="dropdown-ps-scroll">
                {hoveredProject.subprojects.map((subproject) => (
                  <div
                    key={subproject.id}
                    className="dropdown-ps-item"
                    onClick={() => handleSelection(hoveredProject, subproject)}
                  >
                    <div className="item-content-ps">
                      <div className="item-text-ps">{subproject.name}</div>
                      <div className="item-description-ps">
                        {hoveredProject.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
});

export default ProjectSelector;
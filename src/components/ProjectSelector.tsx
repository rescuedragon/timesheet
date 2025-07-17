import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef, CSSProperties, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { Search, ChevronLeft, Edit3, Pin, PinOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast'; // Added for toast notifications
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            whileHover={{ 
                scale: 1.03, 
                y: -4,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
            }}
            whileTap={{ scale: 0.98 }}
            className="relative group rounded-2xl p-6 cursor-pointer transition-all duration-300 ease-in-out shadow-sm w-full"
            style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minHeight: '120px',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                margin: '8px 0'
            }}
            onClick={onClick}
            onMouseEnter={(e) => {
                const line = e.currentTarget.querySelector('.purple-line') as HTMLElement;
                if (line) line.style.transform = 'scaleX(1)';
            }}
            onMouseLeave={(e) => {
                const line = e.currentTarget.querySelector('.purple-line') as HTMLElement;
                if (line) line.style.transform = 'scaleX(0)';
            }}
        >
            <motion.div 
                className="purple-line absolute top-0 left-0 right-0 h-1 transition-transform duration-300 ease-in-out"
                style={{
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left'
                }}
            />
            <motion.div 
                className="flex flex-col items-center justify-center h-full"
                whileHover={{ scale: 1.02 }}
            >
                <h4 className="text-lg font-semibold text-center mb-2" style={{ color: '#1d1d1f' }}>{title}</h4>
                {subtitle && <p className="text-sm text-center" style={{ color: '#6b7280', lineHeight: '1.4' }}>{subtitle}</p>}
            </motion.div>
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ 
            scale: isRunning ? 1.02 : 1.03, 
            y: isRunning ? -2 : -4,
            boxShadow: isRunning ? "0 15px 35px rgba(99, 102, 241, 0.4)" : "0 20px 40px rgba(0, 0, 0, 0.15)"
        }}
        whileTap={{ scale: 0.98 }}
      className="relative group rounded-2xl p-6 cursor-pointer transition-all duration-300 ease-in-out shadow-sm w-full"
        style={{ 
        background: isRunning ? '#6366f1' : 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        minHeight: '120px',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isRunning ? '0 8px 32px rgba(99, 102, 241, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
        margin: '8px 0'
        }}
        onClick={onClick}
      onMouseEnter={(e) => {
        if (!isRunning) {
          const line = e.currentTarget.querySelector('.purple-line') as HTMLElement;
          if (line) line.style.transform = 'scaleX(1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isRunning) {
          const line = e.currentTarget.querySelector('.purple-line') as HTMLElement;
          if (line) line.style.transform = 'scaleX(0)';
        }
      }}
    >
      <motion.div 
        className="purple-line absolute top-0 left-0 right-0 h-1 transition-transform duration-300 ease-in-out"
        style={{
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          transform: 'scaleX(0)',
          transformOrigin: 'left'
        }}
      />
      
      {/* Vibrating Stopwatch Icon */}
      {isRunning && (
        <motion.div
          className="absolute top-3 right-3"
          initial={{ opacity: 0, scale: 0.1, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 800, 
            damping: 15, 
            duration: 0.6,
            scale: {
              type: "spring",
              stiffness: 1000,
              damping: 10
            }
          }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0, 8, -8, 0, 15, -15, 0, 20, -20, 0],
              scale: [1, 1.02, 1, 1.03, 1, 1.05, 1, 1.08, 1, 1.1, 1, 1.12, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.6,
              times: [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88, 1]
            }}
            className="text-white"
          >
            <motion.div
              animate={{ 
                rotate: [0, 8, -8, 0, 12, -12, 0, 18, -18, 0, 25, -25, 0],
                scale: [1, 1.03, 1, 1.05, 1, 1.08, 1, 1.12, 1, 1.15, 1, 1.18, 1]
              }}
              transition={{ 
                duration: 0.6,
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 3.6,
                times: [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88, 1]
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      
      <motion.div 
        className="flex flex-col items-center justify-center h-full"
        whileHover={{ scale: isRunning ? 1.01 : 1.02 }}
      >
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
        </motion.div>
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
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

  const handleSelection = (project, subproject, startTimer = false) => {
    // Prevent selecting a different project/subproject while a timer is running
    if (isTimerRunning && !(runningProject && runningProject.projectId === project.id && runningProject.subprojectId === subproject.id)) {
      const currentProject = allProjects.find(p => p.id === runningProject.projectId);
      const currentSubproject = currentProject?.subprojects.find(sp => sp.id === runningProject.subprojectId);
      // Show toast notification
      const t = toast({
        title: <span className="font-semibold" style={{ color: '#6d28d9' }}>Timer is running</span> as any,
        description: (
          <div style={{ color: '#6d28d9' }}>
            Timer is active for{' '}
            <strong>
              {currentProject?.name} / {currentSubproject?.name}
            </strong>
            .<br />
            Please stop/pause to start a new session.
          </div>
        ) as any,
      });
      setTimeout(() => t.dismiss(), 5000);
      return; // Ignore selection attempts when a different timer is active
    }

    onProjectSelect(project.id);
    onSubprojectSelect(subproject.id);
    setSearchValue(`${project.name} > ${subproject.name}`);
    closeDropdown(); // Use this to clean up UI state
    setProjectUsageCount(prev => ({ ...prev, [project.id]: (prev[project.id] || 0) + 1 }));
    
    // Start the timer if onStartTimer is provided and flag is true
    if (startTimer && onStartTimer) {
      onStartTimer(project.id, subproject.id);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProjectForSubprojects(project);
    setView('subprojects');
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
    if (hoveredProject && dropdownRef.current) {
        const hoveredItem = dropdownRef.current.querySelector(`[data-project-id='${hoveredProject.id}']`);
        if (hoveredItem) {
            const itemRect = hoveredItem.getBoundingClientRect();
            const dropdownRect = dropdownRef.current.getBoundingClientRect();

            setFlyoutStyle({
                position: 'fixed',
                top: `${itemRect.top}px`,
                left: `${dropdownRect.right + 8}px`,
                width: `${dropdownRect.width}px`, // Set width to match dropdown
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

  useLayoutEffect(() => {
    if (hoveredProject && flyoutRef.current && dropdownRef.current) {
        const flyoutHeight = flyoutRef.current.offsetHeight;
        const windowHeight = window.innerHeight;
        
        const currentTop = parseFloat(flyoutStyle.top as string);

        if (currentTop + flyoutHeight > windowHeight) {
            const newTop = Math.max(8, windowHeight - flyoutHeight - 8);
            setFlyoutStyle(prevStyle => ({
                ...prevStyle,
                top: `${newTop}px`,
            }));
        }
    }
  }, [hoveredProject, flyoutStyle.top]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideSearch = searchContainerRef.current && searchContainerRef.current.contains(event.target);
      const isInsideFlyout = flyoutRef.current && flyoutRef.current.contains(event.target);

      if (!isInsideSearch && !isInsideFlyout) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          setActiveProject(currentItems[selectedIndex]);
          setDropdownView('subprojects');
          setSelectedIndex(0);
        } else if (dropdownView === 'subprojects' && currentItems[selectedIndex]) {
          handleSelection(activeProject, currentItems[selectedIndex]);
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
    <motion.div 
      className="p-6 rounded-lg flex flex-col h-full overflow-hidden" 
      style={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '100%',
        height: '100vh'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Search and Tabs */}
      <motion.div 
        className="mb-4 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div ref={searchContainerRef} className="search-container-ps">
          <div className="search-input-wrapper-ps flex items-center">
            <div className="flex-grow relative">
          <input
            type="text"
                className={`search-input-ps ${isTimerRunning ? 'cursor-not-allowed' : 'cursor-text'}`}
                placeholder={isTimerRunning ? "Timer is running..." : "Search projects..."}
          value={searchValue}
          onChange={(e) => {
                    if (!isTimerRunning) {
              setSearchValue(e.target.value);
                        setDropdownOpen(true);
                  setDropdownView('projects');
              }
                }}
                onClick={handleSearchBarClick}
                disabled={isTimerRunning}
                style={{
                  ...(isTimerRunning && {
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#6366f1',
                    color: '#1f2937',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    fontWeight: '500',
                    fontSize: '15px'
                  }),
                  ...(searchValue && !isTimerRunning && {
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#6366f1',
                    color: '#1f2937',
                    fontWeight: '500',
                    fontSize: '15px'
                  })
                }}
              />
              <Search className={`search-icon-ps ${isTimerRunning || searchValue ? 'text-indigo-500 opacity-60' : ''} ${isDropdownOpen ? 'icon-pop-disappear' : 'icon-reappear'}`} />
            </div>
            <motion.div 
              className="flex items-center ml-2 mr-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center bg-gray-100/95 dark:bg-gray-800/95 p-1 rounded-xl backdrop-blur-sm border border-gray-200/40 dark:border-gray-700/40 shadow-sm">
              <motion.button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative ${
                  activeTab === 'frequent' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/40 dark:hover:bg-gray-700/40'
                }`}
                onClick={() => setActiveTab('frequent')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: activeTab === 'frequent' ? '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)' : 'none'
                }}
              >
                Frequently Used
              </motion.button>
              <motion.button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative ${
                  activeTab === 'quick-start' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/40 dark:hover:bg-gray-700/40'
                }`}
                onClick={() => setActiveTab('quick-start')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: activeTab === 'quick-start' ? '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)' : 'none'
                }}
              >
                Quick Start
              </motion.button>
              </div>
              <div className="w-10 flex justify-center">
              {activeTab === 'quick-start' && (
                <motion.button 
                  onClick={() => setIsEditDialogOpen(true)} 
                  className="text-indigo-500 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Edit3 className="h-4 w-4" />
                </motion.button>
              )}
              </div>
            </motion.div>
        </div>
          
          {/* Dropdown - Within Container */}
          <AnimatePresence>
            {shouldShowDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`dropdown-ps ${shouldShowDropdown ? 'show' : ''}`}
                ref={dropdownRef}
                style={{ 
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  overflowY: 'auto',
                  width: '100%'
                }}
              >
          {dropdownView === 'projects' ? (
            <div className="dropdown-ps-scroll">
              {filteredProjects.map((project, index) => (
                <motion.div
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                   whileHover={{ x: 5 }}
                >
                  <div className="item-content-ps">
                    <div className="item-text-ps">{project.name}</div>
                          <div className="item-description-ps">
                            {project.subprojects.length} subprojects
                          </div>
                  </div>
          </motion.div>
                ))}
              </div>
                ) : (
            <div className="dropdown-ps-scroll">
                    {activeProject?.subprojects.map((subproject, index) => (
                <motion.div 
                        key={subproject.id}
                        className={`dropdown-ps-item ${selectedIndex === index ? 'selected' : ''}`}
                        onClick={() => handleSelection(activeProject, subproject)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                       whileHover={{ x: 5 }}
                >
                        <div className="item-content-ps">
                          <div className="item-text-ps">{subproject.name}</div>
                          <div className="item-description-ps">
                            {activeProject.name}
                          </div>
        </div>
                      </motion.div>
              ))}
                    </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
              </div>
      </motion.div>

      {/* Content Area */}
      <motion.div 
        className="flex-grow overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'frequent' && (
            <motion.div
              key="frequent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {view === 'projects' ? (
                <motion.div 
                  className="grid gap-4" 
                  style={{ gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {frequentProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card
                        title={project.name}
                        onClick={() => handleProjectClick(project)}
                        isColorCoded={colorCodedProjectsEnabled}
                        color={generateProjectColor(project.name)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div 
                    className="flex items-center justify-between mb-6"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.button
                      onClick={handleBackToProjects}
                      className="flex items-center gap-2 px-4 py-2 text-base font-medium transition-all duration-300 rounded-xl text-indigo-500 hover:bg-indigo-50"
                      whileHover={{ x: -5, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Projects
                    </motion.button>
                    <motion.h3 
                      className="text-2xl font-bold" 
                      style={{ color: '#1d1d1f' }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {selectedProjectForSubprojects?.name}
                    </motion.h3>
                  </motion.div>
                  <motion.div 
                    className="grid gap-4" 
                    style={{ gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {selectedProjectForSubprojects?.subprojects.map((subproject, index) => (
                      <motion.div
                        key={subproject.id}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Card
                          title={subproject.name}
                          onClick={() => handleSelection(selectedProjectForSubprojects, subproject)}
                          isColorCoded={colorCodedProjectsEnabled}
                          color={generateProjectColor(selectedProjectForSubprojects.id)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'quick-start' && (
            <motion.div
              key="quick-start"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {pinnedCombinations.map(({ project, subproject }, index) => {
                  const isCurrentlyRunning = runningProject && 
                    runningProject.projectId === project.id && 
                    runningProject.subprojectId === subproject.id;
                  
                  return (
                    <motion.div
                      key={`${project.id}-${subproject.id}`}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <TimerCard
                        title={project.name}
                        subtitle={subproject.name}
                        onClick={() => handleSelection(project, subproject, true)}
                        isColorCoded={colorCodedProjectsEnabled}
                        color={generateProjectColor(project.name)}
                        isRunning={isCurrentlyRunning}
                        projectId={project.id}
                        subprojectId={subproject.id}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
            <motion.div
                ref={flyoutRef}
                className="flyout-ps"
                style={flyoutStyle}
                onMouseEnter={cancelHideTimer}
                onMouseLeave={startHideTimer}
                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="dropdown-ps-scroll">
                {hoveredProject.subprojects.map((subproject, index) => (
                    <motion.div
                    key={subproject.id}
                        className="dropdown-ps-item"
                    onClick={() => handleSelection(hoveredProject, subproject)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                   whileHover={{ x: 5 }}
                    >
                        <div className="item-content-ps">
                      <div className="item-text-ps">{subproject.name}</div>
                      <div className="item-description-ps">
                        {hoveredProject.name}
                      </div>
        </div>
                    </motion.div>
                ))}
              </div>
                  </motion.div>
                )}
        </AnimatePresence>,
        document.body
                )}
        </motion.div>
  );
});

export default ProjectSelector;
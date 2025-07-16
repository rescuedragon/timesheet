import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef, CSSProperties } from 'react';
import ReactDOM from 'react-dom';
import { Search, ChevronLeft, Edit3, Pin, PinOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePinnedProjects } from '@/hooks/usePinnedProjects';
import { useSettings } from '@/hooks/useSettings';
import { generateProjectColor } from '../lib/projectColors';
import { storageService } from '@/services/storageService';
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
}

export interface ProjectSelectorRef {
  clearSelection: () => void;
}

// ========== Reusable Card Component ==========
const Card = React.memo<CardProps>(({ title, subtitle, color, onClick, isColorCoded }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="relative group rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out shadow-md hover:shadow-lg hover:-translate-y-1 h-full w-full"
        style={{ 
            backgroundColor: isColorCoded ? color : 'white',
            border: 'none'
        }}
        onClick={onClick}
    >
        <div className="flex flex-col justify-center items-center h-full text-center">
            <h4 className={`text-md font-semibold ${isColorCoded ? 'text-white' : 'text-foreground'}`}>{title}</h4>
            {subtitle && <p className={`text-sm ${isColorCoded ? 'text-white/80' : 'text-muted-foreground'}`}>{subtitle}</p>}
        </div>
    </motion.div>
));

// ========== Main Component ==========
const ProjectSelector = forwardRef<ProjectSelectorRef, ProjectSelectorProps>(({
  projects,
  onProjectSelect,
  onSubprojectSelect,
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
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('frequent');
  const [view, setView] = useState('projects');
  const [selectedProjectForSubprojects, setSelectedProjectForSubprojects] = useState(null);
  const [frequentProjects, setFrequentProjects] = useState([]);
  const [projectUsageCount, setProjectUsageCount] = useState({});

  const { colorCodedProjectsEnabled } = useSettings();
  const { pinned, togglePin, isPinned } = usePinnedProjects();
  
  // Combine projects with a demo fallback
  const allProjects = projects.length > 0 ? projects : Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Project ${i + 1}`,
    subprojects: Array.from({ length: 3 }, (_, j) => ({ id: `${i + 1}-${j + 1}`, name: `Subproject ${j + 1}` })),
  }));

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

  return (
    <div className="bg-blue-50 p-4 rounded-lg flex flex-col h-full">
      {/* New Search and Dropdown */}
      <div ref={searchContainerRef} className="search-container-ps mb-4">
        <div className="search-input-wrapper-ps">
          <Search className="search-icon-ps" />
          <input
            type="text"
            className="search-input-ps"
            placeholder="Search projects..."
          value={searchValue}
          onChange={(e) => {
              setSearchValue(e.target.value);
              if(dropdownView === 'subprojects') {
                  setDropdownView('projects');
                  setActiveProject(null);
              }
              // Show dropdown when typing
              if (e.target.value.trim()) {
                  setDropdownOpen(true);
              }
          }}
          onFocus={() => setDropdownOpen(true)}
          onClick={() => {
            // Clear selection and show dropdown when timer is not running
            const stopwatchState = storageService.getStopwatchState();
            const isTimerRunning = stopwatchState?.isRunning || false;
            
            if (!isTimerRunning) {
              // Clear everything when timer is not running
              setSearchValue('');
              setActiveProject(null);
              setDropdownView('projects');
              setSelectedIndex(0);
              setDropdownOpen(true);
              // Clear parent component selection
              onProjectSelect('');
              onSubprojectSelect('');
            } else {
              // Original behavior when timer is running
              if (isDropdownOpen && filteredProjects.length === 0 && dropdownView === 'projects') {
                setDropdownOpen(false);
              } else {
                setDropdownOpen(true);
              }
            }
          }}
        />
        </div>
        <div ref={dropdownRef} className={`dropdown-ps ${shouldShowDropdown ? 'show' : ''}`}>
          {dropdownView === 'projects' ? (
            <div className="dropdown-ps-scroll">
              {filteredProjects.map((project, index) => (
                <div
                    key={project.id}
                    data-project-id={project.id}
                  className={`dropdown-ps-item ${index === selectedIndex ? 'selected' : ''}`}
                    style={{
                    borderLeft: colorCodedProjectsEnabled ? `3px solid ${generateProjectColor(project.id)}` : 'none'
                    }}
                    onClick={() => {
                    setActiveProject(project);
                    setDropdownView('subprojects');
                    setSelectedIndex(0);
                  }}
                  onMouseEnter={() => handleProjectHover(project)}
                  onMouseLeave={startHideTimer}
                >
                  <div className="item-content-ps">
                    <div className="item-text-ps">{project.name}</div>
                  </div>
          </div>
                ))}
              </div>
          ) : activeProject ? (
            <div className="dropdown-ps-scroll">
              <div className="dropdown-ps-item font-semibold" onClick={() => { setDropdownView('projects'); setSelectedIndex(0); }}><ChevronLeft size={16} className="mr-2" /> Back</div>
              {activeProject.subprojects.map((sp, index) => (
                <div 
                  key={sp.id} 
                  className={`dropdown-ps-item ${index === selectedIndex ? 'selected' : ''}`}
                  style={{
                    borderLeft: colorCodedProjectsEnabled ? `3px solid ${generateProjectColor(activeProject.id)}` : 'none'
                  }}
                  onClick={() => handleSelection(activeProject, sp)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="item-content-ps"><div className="item-text-ps">{sp.name}</div></div>
        </div>
              ))}
                    </div>
          ) : null}
              </div>
        {hoveredProject && dropdownView === 'projects' && ReactDOM.createPortal(
            <div
                className="flyout-ps"
                style={flyoutStyle}
                onMouseEnter={cancelHideTimer}
                onMouseLeave={startHideTimer}
            >
                {hoveredProject.subprojects.map((sp) => (
                    <div
                        key={sp.id}
                        className="dropdown-ps-item"
                        style={{
                          borderLeft: colorCodedProjectsEnabled ? `3px solid ${generateProjectColor(hoveredProject.id)}` : 'none'
                        }}
                        onClick={() => handleSelection(hoveredProject, sp)}
                    >
                        <div className="item-content-ps">
                            <div className="item-text-ps">{sp.name}</div>
        </div>
                    </div>
                ))}
            </div>,
            document.body
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center p-1 bg-blue-100 rounded-full">
          <button onClick={() => setActiveTab('frequent')} className={`px-4 py-1.5 text-sm font-semibold rounded-full ${activeTab === 'frequent' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700'}`}>Frequently Used</button>
          <button onClick={() => setActiveTab('quick_start')} className={`px-4 py-1.5 text-sm font-semibold rounded-full ${activeTab === 'quick_start' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700'}`}>Quick Start</button>
        </div>
        {view === 'subprojects' && <button onClick={() => setView('projects')} className="flex items-center text-sm font-medium text-foreground hover:text-blue-600"><ChevronLeft size={16} className="mr-1" /> Back</button>}
      </div>
      
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab === 'frequent' ? view : 'quick_start'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-grow">
          {activeTab === 'frequent' ? (
            view === 'projects' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full w-full">
                {frequentProjects.map(p => <Card key={p.id} title={p.name} color={generateProjectColor(p.id)} onClick={() => { setView('subprojects'); setSelectedProjectForSubprojects(p); }} isColorCoded={colorCodedProjectsEnabled} />)}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{selectedProjectForSubprojects?.name}</h3>
                <div 
                  className="grid gap-4"
    style={{
                    gridTemplateColumns: `repeat(${getOptimalColumns(selectedProjectForSubprojects?.subprojects.length || 0)}, 1fr)`,
                    justifyItems: 'stretch'
                  }}
                >
                  {selectedProjectForSubprojects?.subprojects.map(s => <Card key={s.id} title={s.name} color={generateProjectColor(selectedProjectForSubprojects.id)} onClick={() => handleSelection(selectedProjectForSubprojects, s)} isColorCoded={colorCodedProjectsEnabled} />)}
                </div>
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full w-full">
                {pinnedCombinations.map(({ project, subproject }) => project && subproject && <Card key={`${project.id}-${subproject.id}`} title={project.name} subtitle={subproject.name} color={generateProjectColor(project.id)} onClick={() => handleSelection(project, subproject)} isColorCoded={colorCodedProjectsEnabled} />)}
                  </div>
                )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export default ProjectSelector;
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search } from 'lucide-react';
import ShinyText from '../common/ShinyText';
// Define Project and Subproject interfaces locally
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

interface ProjectSubprojectSearchBarProps {
  projects: Project[];
  selectedProjectId: string;
  selectedSubprojectId: string;
  onProjectSelect: (projectId: string) => void;
  onSubprojectSelect: (subprojectId: string) => void;
  showProjectSearch?: boolean;
  showSubprojectSearch?: boolean;
}

const ProjectSubprojectSearchBar: React.FC<ProjectSubprojectSearchBarProps> = ({
  projects,
  selectedProjectId,
  selectedSubprojectId,
  onProjectSelect,
  onSubprojectSelect,
  showProjectSearch = true,
  showSubprojectSearch = true,
}) => {
  const [projectSearch, setProjectSearch] = useState('');
  const [subprojectSearch, setSubprojectSearch] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showSubprojectDropdown, setShowSubprojectDropdown] = useState(false);
  const [projectDropdownSearch, setProjectDropdownSearch] = useState('');
  const [subprojectDropdownSearch, setSubprojectDropdownSearch] = useState('');
  const projectInputRef = useRef<HTMLInputElement>(null);
  const subprojectInputRef = useRef<HTMLInputElement>(null);
  const projectDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const subprojectDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [focusedInput, setFocusedInput] = useState<'project' | 'subproject' | null>(null);
  const [projectDropdownIndex, setProjectDropdownIndex] = useState<number>(-1);
  const [subprojectDropdownIndex, setSubprojectDropdownIndex] = useState<number>(-1);

  const selectedProject = React.useMemo(() =>
    projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  const selectedSubproject = React.useMemo(() =>
    selectedProject?.subprojects.find(s => s.id === selectedSubprojectId),
    [selectedProject, selectedSubprojectId]);

  const filteredProjects = React.useMemo(() =>
    projects.filter(project =>
      project.name.toLowerCase().startsWith(projectDropdownSearch.toLowerCase())
    ), [projects, projectDropdownSearch]);

  const filteredSubprojects = React.useMemo(() =>
    selectedProject?.subprojects.filter(subproject =>
      subproject.name.toLowerCase().includes(subprojectDropdownSearch.toLowerCase())
    ) || [], [selectedProject, subprojectDropdownSearch]);

  // Keep projectSearch in sync with selectedProjectId
  useEffect(() => {
    const selected = projects.find(p => p.id === selectedProjectId);
    if (selected) {
      setProjectSearch(selected.name);
    }
  }, [selectedProjectId, projects]);

  // Keep subprojectSearch in sync with selectedSubprojectId
  useEffect(() => {
    const selected = selectedProject?.subprojects.find(s => s.id === selectedSubprojectId);
    if (selected) {
      setSubprojectSearch(selected.name);
    } else {
      setSubprojectSearch('');
    }
  }, [selectedSubprojectId, selectedProject]);

  // Keyboard navigation for project dropdown
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
        onProjectSelect(project.id);
        setShowProjectDropdown(false);
        setProjectDropdownIndex(-1);
        setTimeout(() => {
          subprojectInputRef.current?.focus();
        }, 0);
      }
      e.preventDefault();
    }
  }, [showProjectDropdown, projectDropdownIndex, filteredProjects.length, onProjectSelect]);

  // Keyboard navigation for subproject dropdown
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
        onSubprojectSelect(subproject.id);
        setShowSubprojectDropdown(false);
        setSubprojectDropdownIndex(-1);
        (e.target as HTMLInputElement).blur();
        projectInputRef.current?.focus();
      }
      e.preventDefault();
    }
  }, [showSubprojectDropdown, subprojectDropdownIndex, filteredSubprojects.length, onSubprojectSelect]);

  // Scroll selected project into view
  useEffect(() => {
    if (showProjectDropdown && projectDropdownIndex >= 0 && projectDropdownRefs.current[projectDropdownIndex]) {
      projectDropdownRefs.current[projectDropdownIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [projectDropdownIndex, showProjectDropdown]);
  // Scroll selected subproject into view
  useEffect(() => {
    if (showSubprojectDropdown && subprojectDropdownIndex >= 0 && subprojectDropdownRefs.current[subprojectDropdownIndex]) {
      subprojectDropdownRefs.current[subprojectDropdownIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [subprojectDropdownIndex, showSubprojectDropdown]);

  const bothShown = showProjectSearch && showSubprojectSearch;
  return (
    <div className="flex w-full items-stretch">
      {/* Main Project Search */}
      {showProjectSearch && (
        <div className={bothShown ? "w-1/2 m-0 p-0 h-full" : "w-full m-0 p-0 h-full"}>
          <div className="w-full h-full min-h-16 flex items-center relative" style={{ background: '#e8f0fe', borderRadius: '1rem' }}>
            <input
              ref={projectInputRef}
              type="text"
              value={projectSearch}
              onChange={(e) => {
                setProjectSearch(e.target.value);
                setProjectDropdownSearch(e.target.value);
                setShowProjectDropdown(true);
              }}
              onClick={() => {
                setShowProjectDropdown(true);
                setProjectDropdownIndex(-1);
              }}
              onKeyDown={handleProjectInputKeyDown}
              onFocus={() => {
                setFocusedInput('project');
                setShowProjectDropdown(true);
                setProjectDropdownIndex(-1);
              }}
              onBlur={() => setTimeout(() => setShowProjectDropdown(false), 150)}
              className="w-full h-16 px-5 py-4 pr-12 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-base font-medium text-lg border"
              style={{
                fontSize: '1.125rem',
                background: '#e8f0fe',
                color: '#6b7280',
                borderColor: '#cbd5e1',
                boxShadow: 'none',
                backgroundImage: 'none',
                backgroundClip: 'padding-box',
                backgroundOrigin: 'padding-box',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                outline: 'none',
                transition: 'all 0.2s',
                fontWeight: 500,
                zIndex: 1,
              }}
              placeholder="Search for main project"
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {projectSearch === '' && <ShinyText text="Search for main project" className="text-lg" />}
            </div>
            <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-opacity duration-200 ${projectSearch === '' ? 'opacity-100' : 'opacity-0'}`}>
              <Search size={24} strokeWidth={2} className="text-gray-400" />
            </div>
            {/* Apple-style Elite dropdown for project */}
            <div className={showProjectDropdown ? 'dropdown show' : 'dropdown'} style={{ position: 'absolute', top: 'calc(100% + 12px)', left: 0, right: 0 }}>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, idx) => (
                  <div
                    key={project.id}
                    className={`dropdown-item${projectDropdownIndex === idx ? ' selected' : ''}`}
                    onClick={() => {
                      onProjectSelect(project.id);
                      setShowProjectDropdown(false);
                      setProjectDropdownIndex(-1);
                    }}
                    tabIndex={0}
                  >
                    <div className="item-content">
                      <div className="item-text">{project.name}</div>
                      {/* <div className="item-description">Optional description</div> */}
                    </div>
                  </div>
                ))
              ) : (
                <div className="dropdown-item disabled">No projects found</div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Subproject Search */}
      {showSubprojectSearch && (
        <div className={bothShown ? "w-1/2 m-0 p-0 h-full" : "w-full m-0 p-0 h-full"}>
          <div className="w-full h-full min-h-16 flex items-center relative">
            <input
              ref={subprojectInputRef}
              type="text"
              value={subprojectSearch}
              onChange={(e) => {
                setSubprojectSearch(e.target.value);
                setSubprojectDropdownSearch(e.target.value);
                setShowSubprojectDropdown(true);
              }}
              onClick={() => {
                setShowSubprojectDropdown(true);
                setSubprojectDropdownIndex(-1);
              }}
              onKeyDown={handleSubprojectInputKeyDown}
              onFocus={() => {
                setFocusedInput('subproject');
                setShowSubprojectDropdown(true);
                setSubprojectDropdownIndex(-1);
              }}
              onBlur={() => setTimeout(() => setShowSubprojectDropdown(false), 150)}
              className="w-full h-16 px-5 py-4 pr-12 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-base font-medium text-lg border"
              style={{
                fontSize: '1.125rem',
                background: '#e8f0fe',
                color: '#6b7280',
                borderColor: '#cbd5e1',
                boxShadow: 'none',
                backgroundImage: 'none',
                backgroundClip: 'padding-box',
                backgroundOrigin: 'padding-box',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                outline: 'none',
                transition: 'all 0.2s',
                fontWeight: 500,
                zIndex: 1,
                // Add !important to key properties
                ...(typeof window !== 'undefined' ? {
                  setProperty: (prop, value) => document.documentElement.style.setProperty(prop, value, 'important')
                } : {}),
              }}
              placeholder="Search for subproject"
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {subprojectSearch === '' && <ShinyText text="Search for subproject" className="text-lg" />}
            </div>
            <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-opacity duration-200 ${subprojectSearch === '' ? 'opacity-100' : 'opacity-0'}`}>
              <Search size={24} strokeWidth={2} className="text-gray-400" />
            </div>
            {/* Apple-style Elite dropdown for subproject */}
            <div className={showSubprojectDropdown && selectedProject ? 'dropdown show' : 'dropdown'} style={{ position: 'absolute', top: 'calc(100% + 12px)', left: 0, right: 0, zIndex: 1000 }}>
              {filteredSubprojects.length > 0 ? (
                filteredSubprojects.map((subproject, idx) => (
                  <div
                    key={subproject.id}
                    className={`dropdown-item${subprojectDropdownIndex === idx ? ' selected' : ''}`}
                    onClick={() => {
                      onSubprojectSelect(subproject.id);
                      setShowSubprojectDropdown(false);
                      setSubprojectDropdownIndex(-1);
                    }}
                    tabIndex={0}
                  >
                    <div className="item-content">
                      <div className="item-text">{subproject.name}</div>
                      {/* <div className="item-description">Optional description</div> */}
                    </div>
                  </div>
                ))
              ) : (
                <div className="dropdown-item disabled">No subprojects found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSubprojectSearchBar; 
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
}

const ProjectSubprojectSearchBar: React.FC<ProjectSubprojectSearchBarProps> = ({
  projects,
  selectedProjectId,
  selectedSubprojectId,
  onProjectSelect,
  onSubprojectSelect,
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

  return (
    <div className="flex w-full gap-[1%] items-stretch">
      {/* Main Project Search */}
      <div className="w-[49%] m-0 p-0 h-full">
        <div className="bg-gray-900 rounded-xl w-full h-full min-h-16 flex items-center relative">
          <input
            ref={projectInputRef}
            type="text"
            placeholder={undefined}
            value={projectSearch}
            onChange={(e) => {
              setProjectSearch(e.target.value);
              setProjectDropdownSearch(e.target.value);
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
            onBlur={() => setFocusedInput(null)}
            className="w-full h-16 px-5 py-4 pr-12 text-white bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-base font-medium placeholder-gray-400 text-lg"
            style={{ fontSize: '1.125rem' }}
          />
          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {projectSearch === '' && <ShinyText text="Search for main project" className="text-lg" />}
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white">
            <Search size={24} strokeWidth={2} />
          </div>
        </div>
        {showProjectDropdown && (
          <div className="absolute top-full left-0 mt-3 z-40 w-full">
            <div className="dropdown-glass w-full">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, idx) => (
                  <div
                    key={project.id}
                    ref={el => projectDropdownRefs.current[idx] = el}
                    onClick={() => {
                      onProjectSelect(project.id);
                      setShowProjectDropdown(false);
                      setProjectDropdownIndex(-1);
                    }}
                    className={`dropdown-item-glass${projectDropdownIndex === idx ? ' selected' : ''}`}
                  >
                    <div className="item-content">
                      <div className="item-text">{project.name}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dropdown-item-glass text-center text-gray-400 select-none">
                  {projectDropdownSearch ? 'No projects match your search' : 'No projects available'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Subproject Search */}
      <div className="w-[49%] flex-shrink-0 m-0 p-0 h-full">
        <div className="bg-gray-900 rounded-xl w-full h-full min-h-16 flex items-center relative">
          <input
            ref={subprojectInputRef}
            type="text"
            placeholder={undefined}
            value={subprojectSearch}
            onChange={(e) => {
              setSubprojectSearch(e.target.value);
              setSubprojectDropdownSearch(e.target.value);
            }}
            onClick={() => {
              setShowSubprojectDropdown(true);
              setSubprojectDropdownIndex(-1);
            }}
            onFocus={() => {
              setFocusedInput('subproject');
              setShowSubprojectDropdown(true);
              setSubprojectDropdownIndex(-1);
            }}
            onBlur={() => setFocusedInput(null)}
            onKeyDown={handleSubprojectInputKeyDown}
            className="w-full h-16 px-5 py-4 pr-12 text-white bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-base font-medium placeholder-gray-400 text-lg"
            style={{ fontSize: '1.125rem' }}
          />
          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {subprojectSearch === '' && <ShinyText text="Search for subproject" className="text-lg" />}
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white">
            <Search size={24} strokeWidth={2} />
          </div>
        </div>
        {showSubprojectDropdown && selectedProject && (
          <div className="absolute top-full left-0 mt-3 z-40 w-full">
            <div className="dropdown-glass w-full">
              {filteredSubprojects.length > 0 ? (
                filteredSubprojects.map((subproject, idx) => (
                  <div
                    key={subproject.id}
                    ref={el => subprojectDropdownRefs.current[idx] = el}
                    onClick={() => {
                      onSubprojectSelect(subproject.id);
                      setShowSubprojectDropdown(false);
                      setSubprojectDropdownIndex(-1);
                    }}
                    className={`dropdown-item-glass${subprojectDropdownIndex === idx ? ' selected' : ''}`}
                  >
                    <div className="item-content">
                      <div className="item-text">{subproject.name}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dropdown-item-glass text-center text-gray-400 select-none">
                  No subprojects found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSubprojectSearchBar; 
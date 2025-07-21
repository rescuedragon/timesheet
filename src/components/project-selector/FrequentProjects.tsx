import React, { useCallback } from 'react';
import { generateProjectColor } from '../../lib/projectColors';

interface Project {
  id: string;
  name: string;
  subprojects: any[];
  totalTime: number;
}

interface FrequentProjectsProps {
  frequentProjects: Project[];
  selectedProjectId: string;
  onProjectSelect: (projectId: string) => void;
}

const FrequentProjects: React.FC<FrequentProjectsProps> = React.memo(({ 
  frequentProjects, 
  selectedProjectId, 
  onProjectSelect 
}) => {
  const handleProjectClick = useCallback((projectId: string) => {
    onProjectSelect(projectId);
  }, [onProjectSelect]);

  if (frequentProjects.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
        No frequent projects yet
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {frequentProjects.map((project) => {
        const color = generateProjectColor(project.name);
        const isSelected = selectedProjectId === project.id;
        return (
          <button
            key={project.id}
            className={`px-5 py-2 rounded-xl flex items-center text-base font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 relative overflow-hidden
              ${isSelected
                ? 'text-white shadow-lg scale-105'
                : 'text-white/90 shadow-md hover:scale-105'}
            `}
            style={{
              background: color,
              boxShadow: isSelected ? '0 4px 24px 0 rgba(60,64,67,0.18)' : '0 2px 8px 0 rgba(60,64,67,0.10)',
              border: isSelected ? '2px solid #fff' : 'none',
              color: isSelected ? '#fff' : '#fff',
            }}
            onClick={() => handleProjectClick(project.id)}
          >
            <span className="truncate max-w-[120px] drop-shadow-sm" style={{ textShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.18)' : 'none' }}>{project.name}</span>
            {/* Material ripple effect */}
            <span className="absolute inset-0 pointer-events-none" style={{
              background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
              borderRadius: 'inherit',
              opacity: 0.7,
            }} />
          </button>
        );
      })}
    </div>
  );
});

FrequentProjects.displayName = 'FrequentProjects';

export default FrequentProjects;
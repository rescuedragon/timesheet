import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Subproject {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  subprojects: Subproject[];
}

interface PinnedCombination {
  projectId: string;
  subprojectId: string;
}

interface EditQuickStartDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  projects: Project[];
  pinnedCombinations: PinnedCombination[];
  onSave: (combinations: PinnedCombination[]) => void;
}

const EditQuickStartDialog: React.FC<EditQuickStartDialogProps> = ({
  isOpen,
  onOpenChange,
  projects,
  pinnedCombinations,
  onSave,
}) => {
  const [selectedCombinations, setSelectedCombinations] = React.useState<PinnedCombination[]>(pinnedCombinations);
  const [expandedProjects, setExpandedProjects] = React.useState<Set<string>>(new Set());

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const toggleCombination = (projectId: string, subprojectId: string) => {
    const combination = { projectId, subprojectId };
    const isSelected = selectedCombinations.some(
      c => c.projectId === projectId && c.subprojectId === subprojectId
    );

    if (isSelected) {
      setSelectedCombinations(prev => 
        prev.filter(c => !(c.projectId === projectId && c.subprojectId === subprojectId))
      );
    } else {
      if (selectedCombinations.length >= 12) {
        // Remove the oldest selection if we're at the limit
        setSelectedCombinations(prev => [...prev.slice(1), combination]);
      } else {
        setSelectedCombinations(prev => [...prev, combination]);
      }
    }
  };

  const isCombinationSelected = (projectId: string, subprojectId: string) => {
    return selectedCombinations.some(
      c => c.projectId === projectId && c.subprojectId === subprojectId
    );
  };

  const handleSave = () => {
    onSave(selectedCombinations);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Quick Start Projects</DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Select up to 12 project-subproject combinations for quick access
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleProjectExpansion(project.id)}
                >
                  <div className="flex items-center gap-3">
                    {expandedProjects.has(project.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="font-medium text-gray-900">{project.name}</span>
                    <span className="text-sm text-gray-500">
                      ({project.subprojects.length} subprojects)
                    </span>
                  </div>
                </div>
                
                {expandedProjects.has(project.id) && (
                  <div className="border-t bg-gray-50">
                    {project.subprojects.map((subproject) => (
                      <div key={subproject.id} className="flex items-center gap-3 p-3 pl-8 hover:bg-gray-100">
                        <Checkbox
                          id={`${project.id}-${subproject.id}`}
                          checked={isCombinationSelected(project.id, subproject.id)}
                          onCheckedChange={() => toggleCombination(project.id, subproject.id)}
                        />
                        <label 
                          htmlFor={`${project.id}-${subproject.id}`} 
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {subproject.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedCombinations.length}/12 combinations selected
          </div>
          <Button onClick={handleSave} disabled={selectedCombinations.length === 0}>
            Save ({selectedCombinations.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuickStartDialog; 
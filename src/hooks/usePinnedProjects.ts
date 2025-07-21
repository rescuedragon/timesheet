import { useLocalStorage } from './useLocalStorage';

export interface PinnedCombination {
  projectId: string;
  subprojectId: string;
}

const MAX_PINS = 12;

export const usePinnedProjects = () => {
  const [pinned, setPinned] = useLocalStorage<PinnedCombination[]>('pinnedCombinations', []);
  const [pinnedProjects, setPinnedProjects] = useLocalStorage<string[]>('pinnedProjects', []);

  const addPin = (projectId: string, subprojectId: string) => {
    if (!isPinned(projectId, subprojectId)) {
        if (pinned.length >= MAX_PINS) {
            const newPinned = [...pinned.slice(1), { projectId, subprojectId }];
            setPinned(newPinned);
        } else {
            setPinned([...pinned, { projectId, subprojectId }]);
        }
    }
  };

  const removePin = (projectId: string, subprojectId: string) => {
    setPinned(pinned.filter(p => !(p.projectId === projectId && p.subprojectId === subprojectId)));
  };

  const isPinned = (projectId: string, subprojectId: string) => {
    return pinned.some(p => p.projectId === projectId && p.subprojectId === subprojectId);
  };

  const togglePin = (projectId: string, subprojectId: string) => {
      if(isPinned(projectId, subprojectId)) {
          removePin(projectId, subprojectId);
      } else {
          addPin(projectId, subprojectId);
      }
  }

  const addProjectPin = (projectId: string) => {
    if (!isProjectPinned(projectId)) {
      if (pinnedProjects.length >= MAX_PINS) {
        setPinnedProjects([...pinnedProjects.slice(1), projectId]);
      } else {
        setPinnedProjects([...pinnedProjects, projectId]);
      }
    }
  };

  const removeProjectPin = (projectId: string) => {
    setPinnedProjects(pinnedProjects.filter(id => id !== projectId));
  };

  const isProjectPinned = (projectId: string) => {
    return pinnedProjects.includes(projectId);
  };

  const toggleProjectPin = (projectId: string) => {
    if (isProjectPinned(projectId)) {
      removeProjectPin(projectId);
    } else {
      addProjectPin(projectId);
    }
  };

  const setAllPinnedProjects = (projectIds: string[]) => {
    setPinnedProjects(projectIds.slice(0, MAX_PINS));
  };

  const setAllPinnedCombinations = (combinations: PinnedCombination[]) => {
    setPinned(combinations.slice(0, MAX_PINS));
  };

  return { pinned, togglePin, isPinned, pinnedProjects, toggleProjectPin, isProjectPinned, setAllPinnedProjects, setAllPinnedCombinations };
}; 
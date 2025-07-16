import { useLocalStorage } from './useLocalStorage';

export interface PinnedCombination {
  projectId: string;
  subprojectId: string;
}

const MAX_PINS = 12;

export const usePinnedProjects = () => {
  const [pinned, setPinned] = useLocalStorage<PinnedCombination[]>('pinnedProjects', []);

  const addPin = (projectId: string, subprojectId: string) => {
    if (!isPinned(projectId, subprojectId)) {
        if (pinned.length >= MAX_PINS) {
            // To keep the list at a maximum of 12, remove the oldest item.
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

  return { pinned, togglePin, isPinned };
}; 
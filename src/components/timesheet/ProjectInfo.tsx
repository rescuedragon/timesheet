// Project information display component
// Now renders nothing

import React from 'react';
import { Project, Subproject } from '@/types';

interface ProjectInfoProps {
  selectedProject?: Project;
  selectedSubproject?: Subproject;
}

const ProjectInfo: React.FC<ProjectInfoProps> = () => {
  return null;
};

export default ProjectInfo;
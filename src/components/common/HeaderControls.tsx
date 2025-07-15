import React from 'react';
import { Button } from '@/components/ui/button';

interface HeaderControlsProps {
  onClearStorage: () => void;
  onForceReloadProjects: () => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  onClearStorage,
  onForceReloadProjects
}) => {
  return <></>; // Remove all controls for now, or add back clear/reload if needed
};

export default HeaderControls; 
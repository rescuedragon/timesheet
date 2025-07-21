import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeaderControlsProps {
  onClearStorage: () => void;
  onForceReloadProjects: () => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  onClearStorage,
  onForceReloadProjects
}) => {
  return (
    <div className="fixed top-2 right-2 z-50 flex gap-2">
      <Link to="/api-test">
        <Button variant="outline" size="sm">
          API Test
        </Button>
      </Link>
    </div>
  );
};

export default HeaderControls; 
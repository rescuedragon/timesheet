import React from 'react';
import Settings from '../Settings';

interface AppHeaderProps {
  children?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ children }) => {
  return (
    <header className="w-full flex-shrink-0 z-30 header-material">
      {/* Settings Button */}
      <div className="fixed top-6 right-6 z-50">
        <div className="rounded-2xl shadow-2xl bg-card/90 backdrop-blur-xl border border-border/30 hover:border-border/50 transition-all duration-300">
          <Settings />
        </div>
      </div>
      
      {/* App Title */}
      <>
        <div className="text-center mb-4 animate-fade-in">
          <h1 className="text-6xl font-light text-foreground mb-6 tracking-tight">Timesheet</h1>
        </div>
        {children}
      </>
    </header>
  );
};

export default AppHeader; 
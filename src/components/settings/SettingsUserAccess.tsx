import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface SettingsUserAccessProps {
  progressBarColor: string;
  colorCodedProjectsEnabled: boolean;
  frequentSubprojectsEnabled: boolean;
  onProgressBarColorChange: (color: string) => void;
  onColorCodedProjectsToggle: (enabled: boolean) => void;
  onFrequentSubprojectsToggle: (enabled: boolean) => void;
}

const SettingsUserAccess: React.FC<SettingsUserAccessProps> = ({
  progressBarColor,
  colorCodedProjectsEnabled,
  frequentSubprojectsEnabled,
  onProgressBarColorChange,
  onColorCodedProjectsToggle,
  onFrequentSubprojectsToggle
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Experimental Features</h3>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="space-y-1 mb-3">
              <Label className="text-base">Progress Bar Color</Label>
              <p className="text-sm text-muted-foreground">
                Customize the color of the animated progress bar
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={progressBarColor}
                    onChange={(e) => onProgressBarColorChange(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={progressBarColor}
                    onChange={(e) => onProgressBarColorChange(e.target.value)}
                    placeholder="#006994"
                    className="font-mono"
                  />
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Preview: The progress bar will fill as you log time entries throughout the day.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base">Frequent Subprojects</Label>
              <p className="text-sm text-muted-foreground">
                Show frequently used subprojects as quick selection buttons in the Time Tracker
              </p>
            </div>
            <Switch
              checked={frequentSubprojectsEnabled}
              onCheckedChange={onFrequentSubprojectsToggle}
            />
          </div>
          
          {frequentSubprojectsEnabled && (
            <div className="ml-4 p-4 bg-muted rounded-lg space-y-3">
              <div className="text-sm text-muted-foreground">
                Preview: Quick access buttons for your top 5 most frequently used subprojects will appear below the subproject selector.
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base">Color Coded Projects</Label>
              <p className="text-sm text-muted-foreground">
                Assign unique colors to projects for better visual organization
              </p>
            </div>
            <Switch
              checked={colorCodedProjectsEnabled}
              onCheckedChange={onColorCodedProjectsToggle}
            />
          </div>
          
          {colorCodedProjectsEnabled && (
            <div className="ml-4 p-4 bg-muted rounded-lg space-y-3">
              <div className="text-sm text-muted-foreground">
                Preview: Each project will have a unique color assigned automatically based on its name.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsUserAccess;
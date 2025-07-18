import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TimeLog } from '@/types';

interface TimeLogEditDialogProps {
  open: boolean;
  timeLog: TimeLog | null;
  onSave: (logId: string, updates: Partial<TimeLog>) => void;
  onCancel: () => void;
}

const TimeLogEditDialog: React.FC<TimeLogEditDialogProps> = ({
  open,
  timeLog,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<TimeLog>>({});

  React.useEffect(() => {
    if (timeLog) {
      setFormData({
        projectName: timeLog.projectName,
        subprojectName: timeLog.subprojectName,
        startTime: timeLog.startTime,
        endTime: timeLog.endTime,
        description: timeLog.description
      });
    }
  }, [timeLog]);

  const handleSave = () => {
    if (timeLog) {
      onSave(timeLog.id, formData);
    }
  };

  const handleCancel = () => {
    setFormData({});
    onCancel();
  };

  if (!timeLog) return null;

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md rounded-2xl bg-white p-6 border border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-gray-800 tracking-tight">
            Edit Time Entry
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Project
              </Label>
              <Input
                value={formData.projectName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                className="border-gray-300 bg-white text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Subproject
              </Label>
              <Input
                value={formData.subprojectName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, subprojectName: e.target.value }))}
                className="border-gray-300 bg-white text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Start Time
                </Label>
                <Input
                  type="time"
                  value={formData.startTime || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="border-gray-300 bg-white text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  End Time
                </Label>
                <Input
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="border-gray-300 bg-white text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Description
              </Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What did you work on?"
                rows={3}
                className="border-gray-300 bg-white text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeLogEditDialog; 
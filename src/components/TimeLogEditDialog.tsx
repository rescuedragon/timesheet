import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Calendar, FolderOpen, FileText, X } from 'lucide-react';
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
  const [isAnimating, setIsAnimating] = useState(false);

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
    setIsAnimating(true);
    setTimeout(() => {
      if (timeLog) {
        onSave(timeLog.id, formData);
      }
      setIsAnimating(false);
    }, 200);
  };

  const handleCancel = () => {
    setFormData({});
    onCancel();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diff = end.getTime() - start.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
    return '0h 0m';
  };

  if (!timeLog) return null;

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-[480px] rounded-3xl bg-white/95 backdrop-blur-xl border-0 shadow-[0_32px_64px_rgba(0,0,0,0.12)] p-0 overflow-hidden animate-scale-in">
        {/* Header with close button */}
        <div className="relative px-8 pt-8 pb-4">
          <button
            onClick={handleCancel}
            className="absolute right-6 top-6 w-8 h-8 rounded-full bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-semibold text-gray-900 tracking-tight">
                Time Entry
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">Edit your time log details</p>
            </div>
          </div>
        </div>

        {/* Duration Display */}
        <div className="px-8 mb-6">
          <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100">
            <div className="text-center">
              <div className="text-4xl font-light text-gray-900 mb-2 font-mono tracking-tight">
                {calculateDuration()}
              </div>
              <p className="text-sm text-gray-500">Click to edit • Press Enter to save</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 space-y-6">
          {/* Project Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-600 mb-3">
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wide">Project</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <Input
                  value={formData.projectName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder="Mobile App Launch"
                  className="h-12 border-0 bg-gray-50/80 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg transition-all duration-300 text-lg font-medium"
                />
              </div>
              
              <div>
                <Input
                  value={formData.subprojectName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, subprojectName: e.target.value }))}
                  placeholder="Subproject 3"
                  className="h-12 border-0 bg-gray-50/80 rounded-xl text-gray-700 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:shadow-lg transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Date & Time Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-600 mb-3">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wide">Date & Time</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Start Time
                </Label>
                <Input
                  type="time"
                  value={formData.startTime || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="h-12 border-0 bg-gray-50/80 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg transition-all duration-300 text-lg font-mono"
                />
              </div>
              
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  End Time
                </Label>
                <Input
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="h-12 border-0 bg-gray-50/80 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg transition-all duration-300 text-lg font-mono"
                />
              </div>
            </div>
            
            <div className="text-center py-2">
              <span className="text-sm text-gray-500">
                {timeLog.date && formatDate(timeLog.date)}
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-600 mb-3">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wide">Description (Optional)</span>
            </div>
            
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What did you work on? Add any notes or details about this time entry..."
              rows={4}
              className="border-0 bg-gray-50/80 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg transition-all duration-300 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-8 bg-gray-50/50 mt-8">
          <div className="flex gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-0 bg-white/80 text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isAnimating}
              className={`flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium ${
                isAnimating ? 'scale-95 opacity-80' : 'hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isAnimating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                'Save Entry'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeLogEditDialog; 
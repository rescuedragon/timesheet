// Time log confirmation dialog component
// Apple-style design with comprehensive time entry information

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Project, Subproject } from '@/types';
import { formatTime } from '@/utils/timeUtils';
import { Clock, Calendar, Folder, FileText, X } from 'lucide-react';

interface TimeLogDialogProps {
  open: boolean;
  selectedProject?: Project;
  selectedSubproject?: Subproject;
  duration: number;
  description: string;
  onDescriptionChange: (description: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  startTime?: Date;
  endTime?: Date;
  onDurationChange?: (newDuration: number) => void;
}

const TimeLogDialog: React.FC<TimeLogDialogProps> = ({
  open,
  selectedProject,
  selectedSubproject,
  duration,
  description,
  onDescriptionChange,
  onConfirm,
  onCancel,
  startTime,
  endTime,
  onDurationChange
}) => {
  const formatTimeString = (date?: Date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDateString = (date?: Date) => {
    if (!date) return '--';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDurationDisplay = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}`;
    }
  };

  const [editableDuration, setEditableDuration] = useState(duration);
  const [isEditingDuration, setIsEditingDuration] = useState(false);

  // Update editable duration when prop changes
  useEffect(() => {
    setEditableDuration(duration);
  }, [duration]);

  const handleDurationChange = (newDuration: number) => {
    setEditableDuration(newDuration);
    if (onDurationChange) {
      onDurationChange(newDuration);
    }
  };

  const parseTimeInput = (input: string) => {
    // Parse formats like "1h 30", "1.5h", "90", "1:30"
    const inputLower = input.toLowerCase().trim();
    
    // Handle "1h 30" format
    const hourMinMatch = inputLower.match(/(\d+)h\s*(\d+)/);
    if (hourMinMatch) {
      const hours = parseInt(hourMinMatch[1]);
      const minutes = parseInt(hourMinMatch[2]);
      return (hours * 3600) + (minutes * 60);
    }
    
    // Handle "1.5h" format
    const hourMatch = inputLower.match(/(\d+\.?\d*)h/);
    if (hourMatch) {
      const hours = parseFloat(hourMatch[1]);
      return hours * 3600;
    }
    
    // Handle "90" format (just minutes)
    const minMatch = inputLower.match(/^(\d+)$/);
    if (minMatch) {
      const minutes = parseInt(minMatch[1]);
      return minutes * 60;
    }
    
    // Handle "1:30" format
    const timeMatch = inputLower.match(/(\d+):(\d+)/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      return (hours * 3600) + (minutes * 60);
    }
    
    return duration; // Return original if parsing fails
  };

  const formatDurationForInput = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}`;
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('TimeLogDialog - selectedProject:', selectedProject);
    console.log('TimeLogDialog - selectedSubproject:', selectedSubproject);
  }, [selectedProject, selectedSubproject]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl rounded-2xl bg-white/95 backdrop-blur-xl p-0 border border-gray-200/50 shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-4 pb-3 border-b border-gray-100/50">
          <DialogTitle className="text-xl font-semibold text-black tracking-tight">
            Time Entry
          </DialogTitle>
        </div>

        <div className="p-6">
          <div className="flex gap-6">
            {/* Left Column - Duration & Project Info */}
            <div className="flex-1 space-y-4">
              {/* Duration Display */}
              <div className="text-center py-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/30">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                {isEditingDuration ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formatDurationForInput(editableDuration)}
                      onChange={(e) => {
                        const newDuration = parseTimeInput(e.target.value);
                        setEditableDuration(newDuration);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleDurationChange(editableDuration);
                          setIsEditingDuration(false);
                        }
                      }}
                      onBlur={() => {
                        handleDurationChange(editableDuration);
                        setIsEditingDuration(false);
                      }}
                      className="text-2xl font-light text-black tracking-tight font-mono bg-white/80 border border-blue-300 rounded-lg px-3 py-1 text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      autoFocus
                    />
                    <div className="text-xs text-gray-500">Click to edit • Press Enter to save</div>
                  </div>
                ) : (
                  <div 
                    className="cursor-pointer hover:bg-blue-100/50 rounded-lg p-2 transition-colors duration-200"
                    onClick={() => setIsEditingDuration(true)}
                  >
                    <div className="text-3xl font-light text-black tracking-tight font-mono">
                      {formatDurationDisplay(editableDuration)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Click to edit duration</div>
                  </div>
                )}
              </div>

              {/* Project Information */}
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100/50">
                <div className="flex items-center gap-3 mb-3">
                  <Folder className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Project</div>
                    <div className="text-lg font-semibold text-black">
                      {selectedProject?.name || 'No Project Selected'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Subproject</div>
                    <div className="text-lg font-semibold text-black">
                      {selectedSubproject?.name || 'No Subproject Selected'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Time Details & Description */}
            <div className="flex-1 space-y-4">
              {/* Time Details */}
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100/50">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date & Time</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Start Time</div>
                    <div className="text-base font-semibold text-black font-mono">
                      {formatTimeString(startTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">End Time</div>
                    <div className="text-base font-semibold text-black font-mono">
                      {formatTimeString(endTime)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date</div>
                  <div className="text-sm text-black">{formatDateString(startTime)}</div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Description (Optional)
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder="What did you work on? Add any notes or details about this time entry..."
                  rows={8}
                  className="border-gray-200 bg-white/80 text-black rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 resize-none min-h-[200px] placeholder:text-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100/50">
          <div className="flex gap-3">
            <Button 
              onClick={onCancel}
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-gray-200 text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Save Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeLogDialog;
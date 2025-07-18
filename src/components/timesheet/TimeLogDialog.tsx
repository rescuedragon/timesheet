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
  onStartTimeChange?: (newStartTime: Date) => void;
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
  onDurationChange,
  onStartTimeChange
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
    
    // Update start time based on new duration and end time
    if (endTime) {
      const newStartTime = new Date(endTime.getTime() - (newDuration * 1000));
      if (onStartTimeChange) {
        onStartTimeChange(newStartTime);
      }
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
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onCancel();
      }
    }}>
      <DialogContent className="max-w-4xl rounded-2xl bg-white/85 backdrop-blur-xl p-0 border border-white/20 shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-4 pb-3 border-b border-white/20">
          <DialogTitle className="text-xl font-semibold text-black tracking-tight">
            Time Entry
          </DialogTitle>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column - Duration & Project Info */}
            <div className="space-y-4">
              {/* Duration Display */}
              <div className="h-48 bg-gradient-to-br from-purple-50/80 to-purple-100/50 rounded-2xl border border-purple-200/30 shadow-lg flex flex-col items-center justify-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 shadow-xl mb-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                {isEditingDuration ? (
                  <div className="space-y-2 text-center">
                    <input
                      type="text"
                      value={formatDurationForInput(editableDuration)}
                      onChange={(e) => {
                        const newDuration = parseTimeInput(e.target.value);
                        setEditableDuration(newDuration);
                        
                        // Update start time in real-time as user types
                        if (endTime && onStartTimeChange) {
                          const newStartTime = new Date(endTime.getTime() - (newDuration * 1000));
                          onStartTimeChange(newStartTime);
                        }
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
                      className="text-2xl font-light text-black tracking-tight font-mono bg-white/90 border border-purple-300 rounded-xl px-3 py-1 text-center w-32 focus:outline-none focus:ring-3 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300"
                      autoFocus
                    />
                    <div className="text-sm text-gray-500">Click to edit • Press Enter to save</div>
                  </div>
                ) : (
                  <div 
                    className="cursor-pointer hover:bg-purple-100/50 rounded-xl p-2 transition-colors duration-200 text-center"
                    onClick={() => setIsEditingDuration(true)}
                  >
                    <div className="text-3xl font-light text-black tracking-tight font-mono">
                      {formatDurationDisplay(editableDuration)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 hover:text-purple-600 transition-colors duration-200">Click to edit duration</div>
                  </div>
                )}
              </div>

              {/* Project Information */}
              <div className="h-48 bg-gradient-to-br from-purple-50/60 to-purple-100/30 rounded-2xl border border-purple-200/20 shadow-lg p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
                    <Folder className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Project</div>
                    <div className="text-lg font-semibold text-black">
                      {selectedProject?.name || 'No Project Selected'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
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
            <div className="space-y-4">
              {/* Time Details */}
              <div className="h-48 bg-gradient-to-br from-purple-50/60 to-purple-100/30 rounded-2xl border border-purple-200/20 shadow-lg p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
                    <Calendar className="h-3 w-3 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-black tracking-tight">Date & Time</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Start Time</div>
                    <div className="text-lg font-semibold text-black font-mono">
                      {formatTimeString(startTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">End Time</div>
                    <div className="text-lg font-semibold text-black font-mono">
                      {formatTimeString(endTime)}
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-purple-200/30">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Date</div>
                  <div className="text-sm text-black">{formatDateString(startTime)}</div>
                </div>
              </div>

              {/* Description */}
              <div className="h-48 bg-gradient-to-br from-purple-50/60 to-purple-100/30 rounded-2xl border border-purple-200/20 shadow-lg p-6 flex flex-col">
                <Label className="text-sm font-semibold text-black tracking-tight mb-3">
                  Description (Optional)
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder="What did you work on? Add any notes or details about this time entry..."
                  className="flex-1 border-purple-200/50 bg-white/90 text-black rounded-xl focus:ring-3 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 resize-none placeholder:text-gray-500 shadow-lg backdrop-blur-sm text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50/50 to-purple-100/30 border-t border-purple-200/20">
          <div className="flex gap-4">
            <Button 
              onClick={onCancel}
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-purple-200/50 text-purple-700 hover:bg-purple-100/50 hover:border-purple-300/50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
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
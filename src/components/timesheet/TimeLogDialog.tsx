// Time log confirmation dialog component
// Clean Apple-style design with comprehensive time entry information

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, Square, Calendar, Tag, Edit3, Check, X } from 'lucide-react';
import { Project, Subproject } from '@/types';

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
  const [editableDuration, setEditableDuration] = useState(duration);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setEditableDuration(duration);
  }, [duration]);

  useEffect(() => {
    if (open) {
      console.log('[TimeLogDialog] Opening dialog with project:', selectedProject?.name, 'and subproject:', selectedSubproject?.name);
      
      // Debug logging for project and subproject data
      if (selectedProject && selectedSubproject) {
        console.log('[TimeLogDialog] Project and subproject details:', {
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          subprojectId: selectedSubproject.id,
          subprojectName: selectedSubproject.name
        });
      } else {
        console.warn('[TimeLogDialog] Missing project or subproject data:', {
          project: selectedProject,
          subproject: selectedSubproject
        });
      }
      
      const timer = setTimeout(() => setIsExpanded(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsExpanded(false);
    }
  }, [open, selectedProject, selectedSubproject]);

  const formatTimeString = (date?: Date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDateString = (date?: Date) => {
    if (!date) return 'Today';
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === new Date(today.getTime() - 86400000).toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatDurationDisplay = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}m`;
    }
  };

  const parseTimeInput = (input: string) => {
    const inputLower = input.toLowerCase().trim();
    
    const hourMinMatch = inputLower.match(/(\d+):(\d+)/);
    if (hourMinMatch) {
      const hours = parseInt(hourMinMatch[1]);
      const minutes = parseInt(hourMinMatch[2]);
      return (hours * 3600) + (minutes * 60);
    }
    
    const hourMatch = inputLower.match(/(\d+\.?\d*)h/);
    if (hourMatch) {
      const hours = parseFloat(hourMatch[1]);
      return hours * 3600;
    }
    
    const minMatch = inputLower.match(/^(\d+)m?$/);
    if (minMatch) {
      const minutes = parseInt(minMatch[1]);
      return minutes * 60;
    }
    
    return duration;
  };

  const handleDurationChange = (newDuration: number) => {
    setEditableDuration(newDuration);
    if (onDurationChange) {
      onDurationChange(newDuration);
    }
    
    if (endTime && onStartTimeChange) {
      const newStartTime = new Date(endTime.getTime() - (newDuration * 1000));
      onStartTimeChange(newStartTime);
    }
  };

  const getProgressPercentage = (seconds: number) => {
    const hours = seconds / 3600;
    return Math.min((hours / 8) * 100, 100);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white border-0 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Time Entry</h1>
            <div className="text-sm font-medium text-gray-500">
              {formatDateString(startTime)}
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {/* Duration Circle */}
          <div className="relative flex justify-center mb-10">
            <div className={`transition-all duration-700 ${isExpanded ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
              <div className="relative">
                <div className="w-28 h-28 relative">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-500"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      strokeDasharray={`${getProgressPercentage(editableDuration)}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  
                  {/* Duration Input */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isEditingDuration ? (
                      <input
                        type="text"
                        value={formatDurationDisplay(editableDuration)}
                        onChange={(e) => {
                          const newDuration = parseTimeInput(e.target.value);
                          setEditableDuration(newDuration);
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
                        className="w-16 text-center text-lg font-semibold text-gray-900 bg-white border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="text-center cursor-pointer group"
                        onClick={() => setIsEditingDuration(true)}
                      >
                        <div className="text-2xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {formatDurationDisplay(editableDuration)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">click to edit</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time and Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left Side - Start Time & Project */}
            <div className={`transition-all duration-500 delay-200 ${isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Time</div>
                    <div className="text-xl font-semibold text-gray-900 font-mono">
                      {formatTimeString(startTime)}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {selectedProject?.name || 'No Project'}
                      </div>
                      {selectedSubproject && (
                        <div className="text-sm text-gray-600">
                          {selectedSubproject.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - End Time */}
            <div className={`transition-all duration-500 delay-300 ${isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                    <Square className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End Time</div>
                    <div className="text-xl font-semibold text-gray-900 font-mono">
                      {formatTimeString(endTime)}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div className="text-sm text-gray-600">
                      {formatDateString(startTime)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={`transition-all duration-500 delay-400 ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Edit3 className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              </div>
              
              <Textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="What did you work on? Add any notes or details..."
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none placeholder:text-gray-400 min-h-[100px] max-h-[140px] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-100 p-6 flex-shrink-0">
          <div className="flex gap-3 justify-end">
            <Button 
              onClick={onCancel}
              variant="outline"
              className="px-6 py-2.5 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Log project and subproject data before confirming
                console.log('[TimeLogDialog] Confirming with project data:', {
                  projectId: selectedProject?.id,
                  projectName: selectedProject?.name,
                  subprojectId: selectedSubproject?.id,
                  subprojectName: selectedSubproject?.name
                });
                onConfirm();
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeLogDialog;
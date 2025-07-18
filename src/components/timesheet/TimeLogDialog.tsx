// Time log confirmation dialog component
// Clean Apple-style design with comprehensive time entry information

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Play, Square, Calendar, Tag, Edit3, Check, X } from 'lucide-react';
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
      const timer = setTimeout(() => setIsExpanded(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsExpanded(false);
    }
  }, [open]);

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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-0 shadow-[0_40px_80px_-12px_rgba(0,0,0,0.25)] rounded-[24px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">Time Entry</h1>
            </div>
            <div className="text-sm text-slate-500 font-medium">
              {formatDateString(startTime)}
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Duration Circle */}
          <div className="relative flex justify-center mb-6">
            <div className={`transition-all duration-700 ${isExpanded ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
              <div className="relative">
                <div className="w-24 h-24 relative">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-500"
                      stroke="currentColor"
                      strokeWidth="2"
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
                        className="w-14 text-center text-base font-bold text-slate-800 bg-white/90 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="text-center cursor-pointer group"
                        onClick={() => setIsEditingDuration(true)}
                      >
                        <div className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {formatDurationDisplay(editableDuration)}
                        </div>
                        <div className="text-xs text-slate-500">click to edit</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time and Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Left Side - Start Time & Project */}
            <div className={`transition-all duration-500 delay-200 ${isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Time</div>
                    <div className="text-lg font-bold text-slate-800 font-mono">
                      {formatTimeString(startTime)}
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-500" />
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">
                        {selectedProject?.name || 'No Project'}
                      </div>
                      {selectedSubproject && (
                        <div className="text-xs text-slate-600">
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
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <Square className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">End Time</div>
                    <div className="text-lg font-bold text-slate-800 font-mono">
                      {formatTimeString(endTime)}
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <div className="text-xs text-slate-600">
                      {formatDateString(startTime)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={`transition-all duration-500 delay-400 ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Edit3 className="h-4 w-4 text-slate-500" />
                <h3 className="text-base font-semibold text-slate-800">Description</h3>
              </div>
              
              <Textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="What did you work on? Add any notes or details..."
                className="w-full bg-white/80 border border-slate-300/50 text-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none placeholder:text-slate-400 min-h-[80px] max-h-[120px]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-t from-white via-white/95 to-transparent p-6 flex-shrink-0">
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={onCancel}
              className="px-6 py-2 bg-white/80 hover:bg-white text-slate-700 border border-slate-300 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
import React, { useState } from 'react';
import { Calendar, Tag, FileText, X, Play, Square } from 'lucide-react';
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
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
    return '0';
  };

  if (!timeLog || !open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/5 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleCancel}
      >
        {/* Dialog */}
        <div 
          className="bg-white rounded-xl shadow-lg w-full max-w-md transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-800">Time Entry</h2>
            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Duration Display */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full border border-gray-100 flex flex-col items-center justify-center">
                <div className="text-2xl font-light text-gray-800">
                  0m
                </div>
                <p className="text-xs text-gray-400 mt-1">click to edit</p>
              </div>
            </div>

            {/* Project Section */}
            <div className="flex items-center gap-3 p-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-gray-500" />
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">HR Onboarding</div>
                <div className="text-sm text-gray-500">Training Sessions</div>
              </div>
            </div>

            {/* Date & Time Section */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                    START TIME
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Play className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-xl font-mono">13:12</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                    END TIME
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Square className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-xl font-mono">13:12</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-4">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Today</span>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Description</span>
              </div>
              
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What did you work on? Add any notes or details..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-gray-300 focus:outline-none transition-all duration-200 resize-none text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 rounded-b-2xl">
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 h-12 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium text-base border border-gray-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isAnimating}
                className="flex-1 h-12 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 font-medium text-base flex items-center justify-center"
              >
                {isAnimating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Save Entry
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimeLogEditDialog; 
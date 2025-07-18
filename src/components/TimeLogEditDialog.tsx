import React, { useState } from 'react';
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
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
    return '0';
  };

  if (!timeLog || !open) return null;

  console.log('CUSTOM DIALOG RENDERING - NEW VERSION');

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-red-500/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleCancel}
      >
        {/* Dialog */}
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 border-4 border-red-500"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-red-600">🔥 CUSTOM TIME ENTRY 🔥</h2>
            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Duration Display */}
            <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-light text-gray-900 font-mono mb-1">
                {calculateDuration()}
              </div>
              <p className="text-xs text-gray-500">Click to edit duration</p>
            </div>

            {/* Project Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Project</span>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.projectName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder="Mobile App Launch"
                  className="w-full h-12 px-4 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200 text-base font-medium"
                />
                
                <input
                  type="text"
                  value={formData.subprojectName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, subprojectName: e.target.value }))}
                  placeholder="Subproject 3"
                  className="w-full h-12 px-4 bg-gray-50 border-0 rounded-xl text-gray-700 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200 text-base"
                />
              </div>
            </div>

            {/* Date & Time Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Date & Time</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full h-12 px-4 bg-gray-50 border-0 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200 text-base font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full h-12 px-4 bg-gray-50 border-0 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200 text-base font-mono"
                  />
                </div>
              </div>
              
              <div className="text-center py-2">
                <span className="text-sm text-gray-600 font-medium">
                  {timeLog.date && formatDate(timeLog.date)}
                </span>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Description (Optional)</span>
              </div>
              
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What did you work on? Add any notes or details about this time entry..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-200 resize-none text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 rounded-b-2xl">
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 h-12 rounded-xl bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 font-semibold text-base border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isAnimating}
                className={`flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-base ${
                  isAnimating ? 'opacity-80 scale-95' : 'hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isAnimating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  'Save Entry'
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
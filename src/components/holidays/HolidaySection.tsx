import React from 'react';
import { Trash2 } from 'lucide-react';

interface Holiday {
  id: string;
  name: string;
  date: string;
}

interface HolidaySectionProps {
  holidays: Holiday[];
  containerBgColor: string;
  containerTextColor: string;
  handleRemoveHoliday: (holidayId: string) => void;
}

const HolidaySection: React.FC<HolidaySectionProps> = ({
  holidays,
  containerBgColor,
  containerTextColor,
  handleRemoveHoliday
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-lg flex items-center justify-center text-white text-base">
          🎉
        </div>
        <div className="text-lg font-semibold text-gray-800">Public Holidays</div>
      </div>
      
      {/* Holiday Items */}
      {holidays.length > 0 ? (
        <div>
          {holidays.map(holiday => (
            <div key={holiday.id} className="flex items-center gap-3 py-4 border-b border-gray-100 last:border-b-0 group">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">
                🇮🇳
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-800 mb-1">{holiday.name}</h4>
                <p className="text-sm text-teal-600">
                  {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 rounded transition-all duration-200"
                onClick={() => handleRemoveHoliday(holiday.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-2xl opacity-80">
            🎉
          </div>
          <h3 className="text-gray-800 text-lg mb-2">No holidays this month</h3>
          <p className="text-teal-600 text-sm">Holidays for other months will appear here when you navigate to them</p>
        </div>
      )}
    </div>
  );
};

export default HolidaySection;
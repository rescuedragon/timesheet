import React from 'react';
import { Calendar } from 'lucide-react';

/**
 * Props interface for the CalendarUI component
 */
interface CalendarUIProps {
  month: Date;                                    // Current month to display
  nextMonth: () => void;                          // Function to navigate to next month
  prevMonth: () => void;                          // Function to navigate to previous month
  containerBgColor: string;                       // Background color for calendar header
  containerTextColor: string;                     // Text color for calendar header
  getHolidayDates: () => Date[];                  // Function to get holiday dates
  getPlannedLeaveDates: () => Date[];             // Function to get planned leave dates
  showPlannedLeaves: boolean;                     // Whether to show planned leaves
  entries: any[];                                 // Time entries for the calendar
  selectedDate: Date | undefined;                 // Currently selected date
  setSelectedDateForEntries: (date: Date) => void; // Function to set selected date
  isSameDay: (date1: Date, date2: Date) => boolean; // Function to compare dates
}

/**
 * Calendar UI Component
 * Displays an interactive calendar with holidays, planned leaves, and time entries
 */
const CalendarUI: React.FC<CalendarUIProps> = ({
  month,
  nextMonth,
  prevMonth,
  containerBgColor,
  containerTextColor,
  getHolidayDates,
  getPlannedLeaveDates,
  showPlannedLeaves,
  entries,
  selectedDate,
  setSelectedDateForEntries,
  isSameDay
}) => {
  // Constants for calendar display
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /**
   * Helper function: Get number of days in a month
   */
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  /**
   * Helper function: Get first day of month (0-6, Monday-Sunday)
   */
  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Adjust Sunday from 0 to 6
  };

  /**
   * Handle date selection
   */
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(month.getFullYear(), month.getMonth(), day);
    setSelectedDateForEntries(clickedDate);
  };

  /**
   * Render calendar days with appropriate styling based on date type
   * (weekend, holiday, leave, has entries, etc.)
   */
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(month);
    const firstDay = getFirstDayOfMonth(month);
    const days = [];
    const holidayDates = getHolidayDates();
    const leaveDates = getPlannedLeaveDates();

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Generate calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const hasEntries = entries.some(entry => isSameDay(entry.date, date));
      const isToday = date.toDateString() === new Date().toDateString();
      const isHoliday = holidayDates.some(d => d.toDateString() === date.toDateString());
      const isLeave = showPlannedLeaves && leaveDates.some(d => d.toDateString() === date.toDateString());
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      // Build className based on date type with Apple-like styling
      let className = "group h-12 flex items-center justify-center rounded-2xl font-semibold cursor-pointer transition-all duration-300 text-base relative hover:scale-110 active:scale-95 select-none";

      if (isToday) {
        className += " bg-blue-500 text-white shadow-xl shadow-blue-500/40 hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-500/50 ring-2 ring-blue-300/50";
      } else if (isSelected) {
        className += " bg-white text-gray-900 shadow-xl shadow-white/20 hover:bg-gray-100 ring-2 ring-white/30";
      } else if (isHoliday) {
        className += " bg-red-500 text-white shadow-xl shadow-red-500/40 hover:bg-red-600 hover:shadow-2xl hover:shadow-red-500/50 ring-2 ring-red-300/50";
      } else if (isLeave) {
        className += " bg-green-500 text-white shadow-xl shadow-green-500/40 hover:bg-green-600 hover:shadow-2xl hover:shadow-green-500/50 ring-2 ring-green-300/50";
      } else if (isWeekend) {
        className += " bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 hover:text-gray-300 border border-gray-700/60 hover:border-gray-600/80 hover:shadow-lg";
      } else {
        className += " bg-gray-800/40 text-white hover:bg-gray-700/60 hover:text-white border border-gray-700/40 hover:border-gray-600/60 hover:shadow-xl shadow-sm";
      }

      const dotColor = isToday || isHoliday || isLeave ? 'white' : isSelected ? 'red' : 'red';

      days.push(
        <div key={day} onClick={() => handleDateClick(day)} className={className}>
          {hasEntries && (
            <div
              className={`w-2 h-2 rounded-full ${dotColor === 'white' ? 'bg-white shadow-lg' : 'bg-red-500 shadow-lg shadow-red-500/60'
                } absolute top-1 right-1 animate-pulse group-hover:scale-125 transition-all duration-300`}
            ></div>
          )}
          <span className="group-hover:scale-110 transition-all duration-300 font-semibold">
            {day}
          </span>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full">
      <div className="bg-gray-900 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800/60 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:border-gray-700/80">
        {/* Calendar Header */}
        <div className="px-6 py-5 relative overflow-hidden bg-gray-800/50">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg">
                <Calendar size={20} className="drop-shadow-sm text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-white drop-shadow-sm">
                Calendar
              </span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={prevMonth}
                className="group w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl text-white"
              >
                <span className="text-lg font-semibold group-hover:-translate-x-0.5 transition-transform duration-300">‹</span>
              </button>
              <div className="text-xl font-semibold min-w-48 text-center tracking-tight text-white drop-shadow-sm">
                {months[month.getMonth()]} {month.getFullYear()}
              </div>
              <button
                onClick={nextMonth}
                className="group w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl text-white"
              >
                <span className="text-lg font-semibold group-hover:translate-x-0.5 transition-transform duration-300">›</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="px-6 py-5 bg-gray-900">
          {/* Single unified grid for headers and days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers (Mon, Tue, etc.) */}
            {daysOfWeek.map((day, index) => (
              <div
                key={day}
                className={`h-8 flex items-center justify-center text-center font-semibold text-xs tracking-wider uppercase mb-2 ${index >= 5 ? 'text-gray-500' : 'text-gray-400'
                  }`}
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {renderCalendarDays()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarUI;
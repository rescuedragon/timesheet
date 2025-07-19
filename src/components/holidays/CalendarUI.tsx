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
      days.push(<div key={`empty-${i}`} className="w-12 h-12"></div>);
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

      // Build className based on date type
      let className = "w-12 h-12 flex items-center justify-center rounded-lg font-semibold cursor-pointer transition-all duration-200 text-xl relative hover:scale-105";
      if (isWeekend) className += " bg-gray-100 text-gray-500 hover:bg-gray-200";
      else className += " hover:bg-gray-100 text-gray-700";
      if (isToday) className += " bg-blue-500 text-white hover:bg-blue-600";
      else if (isSelected) className += " bg-gray-700 text-white";
      else if (isHoliday) className += " bg-red-500 text-white hover:bg-red-600";
      else if (isLeave) className += " bg-green-500 text-white hover:bg-green-600";

      const dotColor = isToday || isSelected || isHoliday || isLeave ? 'white' : 'black';

      days.push(
        <div key={day} onClick={() => handleDateClick(day)} className={className}>
          {hasEntries && (
            <div
              className={`w-2 h-2 rounded-full ${dotColor === 'white' ? 'bg-white' : 'bg-red-500'} absolute top-1 right-1 animate-pulse`}
            ></div>
          )}
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full">
      <div className="bg-white/10 rounded-xl shadow-2xl border border-black/5 overflow-hidden backdrop-blur-md">
        {/* Calendar Header */}
        <div className="p-6 shadow-inner" style={{ backgroundColor: containerBgColor, boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.1)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={20} />
              <span className="text-lg font-bold" style={{ color: containerTextColor }}>Calendar</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-lg bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all font-bold text-lg hover:scale-110"
                style={{ color: containerTextColor }}
              >
                ‹
              </button>
              <div className="text-xl font-bold min-w-48 text-center" style={{ color: containerTextColor }}>
                {months[month.getMonth()]} {month.getFullYear()}
              </div>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-lg bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all font-bold text-lg hover:scale-110"
                style={{ color: containerTextColor }}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="p-6">
          {/* Day headers (Mon, Tue, etc.) */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day, index) => (
              <div key={day} className={`w-12 text-center font-bold py-2 text-lg ${index >= 5 ? 'text-gray-400' : 'text-gray-600'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days grid */}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendarDays()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarUI;
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
      days.push(<div key={`empty-${i}`} className="h-16"></div>);
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

      // Build className based on date type with modern styling matching HTML design
      let className = "h-16 w-16 flex items-center justify-center text-center font-medium text-xl cursor-pointer border border-transparent rounded-3xl transition-all duration-200 relative mx-auto";

      if (isToday) {
        className += " bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-2xl shadow-teal-500/40 transform scale-105 font-semibold";
      } else if (isSelected) {
        className += " bg-gradient-to-br from-teal-100 to-emerald-50 text-teal-800 border-teal-200 shadow-2xl hover:from-teal-200 hover:to-emerald-100";
      } else if (isHoliday) {
        className += " bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-2xl shadow-rose-400/40 transform scale-105";
      } else if (isLeave) {
        className += " bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-2xl shadow-amber-400/40 transform scale-105";
      } else {
        className += " bg-gray-50 text-gray-700 hover:bg-teal-50 hover:border-teal-300 hover:text-gray-800 hover:scale-105";
      }

      days.push(
        <div key={day} onClick={() => handleDateClick(day)} className={className}>
          {hasEntries && (
            <div
              className="w-2.5 h-2.5 bg-teal-500 rounded-full absolute top-2.5 right-2.5 shadow-sm"
            ></div>
          )}
          <span className="font-medium text-xl">
            {day}
          </span>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full">
      {/* Modern Card Design with Teal Theme */}
      <div className="bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-100/60 overflow-hidden transition-all duration-500 hover:shadow-3xl hover:border-teal-200/80 hover:scale-[1.01]">

        {/* Floating Header with Glassmorphism */}
        <div className="px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-100/40 via-emerald-50/30 to-teal-100/40 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-teal-50/20"></div>

          <div className="relative flex items-center justify-between">
            {/* Left side - Calendar icon and title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-3xl blur-lg opacity-30"></div>
                <div className="relative p-3 rounded-3xl bg-gradient-to-br from-teal-100 to-emerald-100 shadow-xl border border-teal-200/50">
                  <Calendar size={24} className="text-teal-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800 mb-1">Calendar</h2>
                <p className="text-sm text-teal-600 font-medium">Track your holidays & events</p>
              </div>
            </div>

            {/* Right side - Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={prevMonth}
                className="group relative w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-md flex items-center justify-center hover:bg-teal-50/80 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl text-gray-700 border border-teal-100/50 hover:border-teal-200/70"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative text-xl font-bold group-hover:-translate-x-0.5 transition-transform duration-300 text-teal-600">‹</span>
              </button>

              <div className="px-6 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-teal-100/50 shadow-lg">
                <div className="text-xl font-bold text-center tracking-tight text-gray-800 min-w-44">
                  {months[month.getMonth()]} {month.getFullYear()}
                </div>
              </div>

              <button
                onClick={nextMonth}
                className="group relative w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-md flex items-center justify-center hover:bg-teal-50/80 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl text-gray-700 border border-teal-100/50 hover:border-teal-200/70"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative text-xl font-bold group-hover:translate-x-0.5 transition-transform duration-300 text-teal-600">›</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid with Enhanced Design */}
        <div className="px-8 pb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-teal-100/40 shadow-lg p-6">
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers with enhanced styling */}
              {daysOfWeek.map((day, index) => (
                <div
                  key={day}
                  className={`h-16 flex items-center justify-center text-center font-semibold text-xl tracking-wider uppercase mb-2 rounded-3xl ${index >= 5
                      ? 'text-teal-500 bg-teal-50/50'
                      : 'text-gray-600 bg-gray-50/50'
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
    </div>
  );
};

export default CalendarUI;
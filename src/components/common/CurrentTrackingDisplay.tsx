import React from 'react';
import ShinyText from './ShinyText';

export interface Project {
    id: string;
    name: string;
    subprojects: Subproject[];
    totalTime: number;
}

export interface Subproject {
    id: string;
    name: string;
    totalTime: number;
}

interface CurrentTrackingDisplayProps {
    selectedProject: Project | undefined;
    selectedSubproject: Subproject | undefined;
    isTimerRunning: boolean;
    currentTime: Date;
}

// Custom MapPinClock Icon Component
const MapPinClock: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
            {/* Map pin shape */}
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            {/* Clock face circle */}
            <circle cx="12" cy="9" r="3"/>
            {/* Clock hands */}
            <line x1="12" y1="9" x2="12" y2="7" strokeWidth="1.5"/>
            <line x1="12" y1="9" x2="14" y2="9" strokeWidth="1"/>
            {/* Clock dots for hours */}
            <circle cx="12" cy="6" r="0.5" fill="currentColor"/>
            <circle cx="15" cy="9" r="0.5" fill="currentColor"/>
            <circle cx="12" cy="12" r="0.5" fill="currentColor"/>
            <circle cx="9" cy="9" r="0.5" fill="currentColor"/>
        </svg>
    );
};

// Analog Clock Component
const AnalogClock: React.FC<{ time: Date; timezone: string }> = ({ time, timezone }) => {
    const timeInZone = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone,
        hour12: false
    }).formatToParts(time);

    const hours = parseInt(timeInZone.find(part => part.type === 'hour')?.value || '0');
    const minutes = parseInt(timeInZone.find(part => part.type === 'minute')?.value || '0');
    const seconds = parseInt(timeInZone.find(part => part.type === 'second')?.value || '0');

    const hourAngle = (hours % 12) * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Clock face */}
            <circle cx="50" cy="50" r="48" fill="transparent" stroke="white" strokeWidth="1"/>
            
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => {
                const angle = (i * 30) - 90;
                const x1 = 50 + 40 * Math.cos(angle * Math.PI / 180);
                const y1 = 50 + 40 * Math.sin(angle * Math.PI / 180);
                const x2 = 50 + 35 * Math.cos(angle * Math.PI / 180);
                const y2 = 50 + 35 * Math.sin(angle * Math.PI / 180);
                return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1"/>
                );
            })}
            
            {/* Hour hand */}
            <line
                x1="50"
                y1="50"
                x2={50 + 20 * Math.cos((hourAngle - 90) * Math.PI / 180)}
                y2={50 + 20 * Math.sin((hourAngle - 90) * Math.PI / 180)}
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
            />
            
            {/* Minute hand */}
            <line
                x1="50"
                y1="50"
                x2={50 + 30 * Math.cos((minuteAngle - 90) * Math.PI / 180)}
                y2={50 + 30 * Math.sin((minuteAngle - 90) * Math.PI / 180)}
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            
            {/* Second hand */}
            <line
                x1="50"
                y1="50"
                x2={50 + 35 * Math.cos((secondAngle - 90) * Math.PI / 180)}
                y2={50 + 35 * Math.sin((secondAngle - 90) * Math.PI / 180)}
                stroke="#ff6b35"
                strokeWidth="1"
                strokeLinecap="round"
            />
            
            {/* Center dot */}
            <circle cx="50" cy="50" r="2" fill="white"/>
        </svg>
    );
};

const CurrentTrackingDisplay: React.FC<CurrentTrackingDisplayProps> = ({
    selectedProject,
    selectedSubproject,
    isTimerRunning,
    currentTime
}) => {
    // Format time functions
    const formatTime = (date: Date, timezone: string) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone,
            hour12: true
        }).format(date);
    };

    // Format date in long format (17 July 2025)
    const formatDateLong = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    return (
        <div className="bg-[#4285F4] rounded-xl shadow-lg w-full max-w-full overflow-hidden h-32">
            <div className="flex items-center w-full p-4 h-full">
                {selectedProject && selectedSubproject ? (
                    // When project is selected - show tracking interface
                    <>
                        {/* Currently Tracking Indicator */}
                        <div className="flex items-center space-x-6 min-w-0">
                            <div className="relative">
                                <div className={`w-4 h-4 rounded-full bg-white ${isTimerRunning ? 'animate-pulse' : ''}`}></div>
                                {isTimerRunning && (
                                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-white animate-ping opacity-75"></div>
                                )}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-[0.15em] leading-relaxed text-gray-300">
                                Currently<br />Tracking
                            </div>
                        </div>

                        {/* Centered Project and Subproject Section */}
                        <div className="flex items-center justify-center flex-1">
                            {/* Project Section */}
                            <div className="px-12 min-w-0">
                                <div className="text-xs font-bold uppercase tracking-[0.15em] mb-3 text-gray-300">
                                    Project
                                </div>
                                <div className="text-2xl font-semibold tracking-tight truncate">
                                    <ShinyText
                                        text={selectedProject.name}
                                        disabled={false}
                                        speed={3}
                                        className="text-white"
                                    />
                                </div>
                            </div>

                            {/* Subproject Section */}
                            <div className="px-12 min-w-0">
                                <div className="text-xs font-bold uppercase tracking-[0.15em] mb-3 text-gray-300">
                                    Subproject
                                </div>
                                <div className="text-2xl font-semibold tracking-tight truncate">
                                    <ShinyText
                                        text={selectedSubproject.name}
                                        disabled={false}
                                        speed={3}
                                        className="text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // When no project is selected - show date on left half
                    <>
                        {/* Left half - Today's date */}
                        <div className="w-1/2 flex items-center justify-center">
                            <div className="text-3xl font-semibold">
                                <ShinyText
                                    text={formatDateLong(currentTime)}
                                    disabled={false}
                                    speed={3}
                                    className="text-white"
                                />
                            </div>
                        </div>

                        {/* Right half - World clocks horizontally */}
                        <div className="w-1/2 flex items-center justify-between px-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-28 h-full">
                                    <AnalogClock time={currentTime} timezone="Asia/Kolkata" />
                                </div>
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <MapPinClock className="w-4 h-4 text-white" />
                                        <span className="text-sm font-medium text-white">India</span>
                                    </div>
                                    <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                                        {formatTime(currentTime, 'Asia/Kolkata')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-28 h-full">
                                    <AnalogClock time={currentTime} timezone="Europe/London" />
                                </div>
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <MapPinClock className="w-4 h-4 text-white" />
                                        <span className="text-sm font-medium text-white">UK</span>
                                    </div>
                                    <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                                        {formatTime(currentTime, 'Europe/London')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-28 h-full">
                                    <AnalogClock time={currentTime} timezone="America/New_York" />
                                </div>
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <MapPinClock className="w-4 h-4 text-white" />
                                        <span className="text-sm font-medium text-white">USA</span>
                                    </div>
                                    <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                                        {formatTime(currentTime, 'America/New_York')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Time zones - Vertically stacked on the right (only when project is selected) */}
                {selectedProject && selectedSubproject && (
                    <div className="flex flex-col space-y-1 select-none">
                        <div className="flex items-center space-x-3">
                            <MapPinClock className="w-4 h-4 text-white" />
                            <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                                {formatTime(currentTime, 'Asia/Kolkata')}
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MapPinClock className="w-4 h-4 text-white" />
                            <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                                {formatTime(currentTime, 'Europe/London')}
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MapPinClock className="w-4 h-4 text-white" />
                            <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                                {formatTime(currentTime, 'America/New_York')}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurrentTrackingDisplay; 
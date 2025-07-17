import React from 'react';
import ShinyText from './ShinyText';
import { GiIndiaGate } from 'react-icons/gi';
import { FaFlagUsa } from 'react-icons/fa';
import { GiTowerBridge } from 'react-icons/gi';

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

// Custom Location Icon Component
const LocationIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
            {/* Map pin shape */}
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            {/* Center dot */}
            <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
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
        <div className="bg-[#7E2EFF] rounded-xl shadow-lg w-full max-w-full overflow-hidden h-32">
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
                                <div className="text-2xl font-semibold tracking-tight truncate text-white">
                                    {selectedProject.name}
                                </div>
                            </div>

                            {/* Subproject Section */}
                            <div className="px-12 min-w-0">
                                <div className="text-xs font-bold uppercase tracking-[0.15em] mb-3 text-gray-300">
                                    Subproject
                                </div>
                                <div className="text-2xl font-semibold tracking-tight truncate text-white">
                                    {selectedSubproject.name}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // When no project is selected - show date and world clocks evenly distributed
                    <>
                        {/* Date */}
                        <div className="flex items-center justify-center ml-8">
                            <div className="text-3xl font-semibold text-white pl-8">
                                {formatDateLong(currentTime)}
                            </div>
                        </div>

                        {/* World clocks evenly distributed */}
                        <div className="flex items-center justify-evenly flex-1 px-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-24 h-full" style={{ opacity: 0.5, filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}>
                                    <AnalogClock time={currentTime} timezone="Asia/Kolkata" />
                                </div>
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <LocationIcon className="w-4 h-4 text-white" />
                                        <span className="text-sm font-medium text-white">India</span>
                                    </div>
                                    <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                                        {formatTime(currentTime, 'Asia/Kolkata')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-24 h-full" style={{ opacity: 0.5, filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}>
                                    <AnalogClock time={currentTime} timezone="Europe/London" />
                                </div>
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <LocationIcon className="w-4 h-4 text-white" />
                                        <span className="text-sm font-medium text-white">UK</span>
                                    </div>
                                    <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                                        {formatTime(currentTime, 'Europe/London')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-24 h-full" style={{ opacity: 0.5, filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}>
                                    <AnalogClock time={currentTime} timezone="America/New_York" />
                                </div>
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <LocationIcon className="w-4 h-4 text-white" />
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
                            <img src="/flags/india.png" alt="India Flag" className="w-5 h-4 rounded-sm object-cover" />
                            <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                                {formatTime(currentTime, 'Asia/Kolkata')}
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <img src="/flags/uk.png" alt="UK Flag" className="w-5 h-4 rounded-sm object-cover" />
                            <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                                {formatTime(currentTime, 'Europe/London')}
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <img src="/flags/usa.png" alt="USA Flag" className="w-5 h-4 rounded-sm object-cover" />
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
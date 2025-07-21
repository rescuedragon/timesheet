import { useState, useEffect } from 'react';
import { storageService } from '@/services/storageService';

export const useTimerStatus = () => {
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
    const [elapsedTime, setElapsedTime] = useState<number>(0);

    useEffect(() => {
        const checkTimerStatus = () => {
            const stopwatchState = storageService.getStopwatchState();
            setIsTimerRunning(stopwatchState?.isRunning || false);
            if (stopwatchState?.isRunning) {
                const now = new Date();
                const startTime = new Date(stopwatchState.startTime);
                const currentElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                setElapsedTime((stopwatchState.elapsedTime || 0) + currentElapsed);
            } else {
                setElapsedTime(stopwatchState?.elapsedTime || 0);
            }
        };

        checkTimerStatus();
        const interval = setInterval(checkTimerStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    return {
        isTimerRunning,
        elapsedTime
    };
}; 
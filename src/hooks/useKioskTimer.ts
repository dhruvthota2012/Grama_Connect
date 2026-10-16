import { useState, useEffect, useCallback, useRef } from 'react';

interface UseKioskTimerOptions {
  timeoutSeconds?: number;
  warningThresholdSeconds?: number;
  enabled?: boolean;
  onTimeout: () => void;
}

export function useKioskTimer({
  timeoutSeconds = 60,
  warningThresholdSeconds = 15,
  enabled = true,
  onTimeout,
}: UseKioskTimerOptions) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(timeoutSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timeoutCallbackRef = useRef(onTimeout);

  useEffect(() => {
    timeoutCallbackRef.current = onTimeout;
  }, [onTimeout]);

  // Reset timer to full duration
  const resetTimer = useCallback(() => {
    setSecondsRemaining(timeoutSeconds);
  }, [timeoutSeconds]);

  // Pause and resume functions
  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Activity listener: resets countdown on any user action
  useEffect(() => {
    if (!enabled) return;

    const handleUserActivity = () => {
      // Only reset if not in the final urgent warning state or if user clicked to dismiss
      // If remaining <= warningThreshold, user must explicitly click "I'm still here" or interact
      setSecondsRemaining((prev) => {
        // If already at 0, do nothing
        if (prev <= 0) return 0;
        return timeoutSeconds;
      });
    };

    const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [enabled, timeoutSeconds]);

  // Main 1-second interval ticker
  useEffect(() => {
    if (!enabled || isPaused) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          timeoutCallbackRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [enabled, isPaused]);

  return {
    secondsRemaining,
    isWarning: secondsRemaining > 0 && secondsRemaining <= warningThresholdSeconds,
    resetTimer,
    pauseTimer,
    resumeTimer,
  };
}


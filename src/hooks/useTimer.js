import { useState, useEffect, useCallback } from 'react';

const FOCUS_SECONDS = 25 * 60;  // 1500
const BREAK_SECONDS = 5 * 60;   // 300

export function useTimer() {
  const [phase, setPhase] = useState('idle');
  // phases: idle | running | paused | sessionComplete | breakIdle | breakRunning | breakComplete

  const [timeLeft, setTimeLeft] = useState(FOCUS_SECONDS);
  const [sessions, setSessions] = useState(0);

  // The countdown engine — runs only when timer is active
  useEffect(() => {
    const isActive = phase === 'running' || phase === 'breakRunning';
    if (!isActive) return;

    // If already at zero, transition phase instead of counting further
    if (timeLeft === 0) {
      if (phase === 'running') {
        setSessions(prev => prev + 1);
        setPhase('sessionComplete');
      } else if (phase === 'breakRunning') {
        setPhase('breakComplete');
      }
      return;
    }

    const tick = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(tick); // cleanup on phase change or unmount
  }, [phase, timeLeft]);

  // Save sessions to localStorage so they persist across page reloads
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('focusSessions') || '{}');
    saved[today] = sessions;
    localStorage.setItem('focusSessions', JSON.stringify(saved));
  }, [sessions]);

  // Load today's session count on first mount
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('focusSessions') || '{}');
    if (saved[today]) setSessions(saved[today]);
  }, []);

  // --- Actions ---
  const start = useCallback(() => setPhase('running'), []);
  const pause = useCallback(() => setPhase('paused'), []);
  const resume = useCallback(() => setPhase('running'), []);

  const reset = useCallback(() => {
    setPhase('idle');
    setTimeLeft(FOCUS_SECONDS);
  }, []);

  const startBreak = useCallback(() => {
    setPhase('breakRunning');
    setTimeLeft(BREAK_SECONDS);
  }, []);

  const skipBreak = useCallback(() => {
    setPhase('idle');
    setTimeLeft(FOCUS_SECONDS);
  }, []);

  const startNext = useCallback(() => {
    setPhase('idle');
    setTimeLeft(FOCUS_SECONDS);
  }, []);

  // --- Derived values for the UI ---
  const isBreakPhase = phase === 'breakIdle' || phase === 'breakRunning' || phase === 'breakComplete' || phase === 'sessionComplete';
  const totalSeconds = isBreakPhase ? BREAK_SECONDS : FOCUS_SECONDS;
  const progress = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;

  return {
    phase,
    timeLeft,
    sessions,
    progress,
    start,
    pause,
    resume,
    reset,
    startBreak,
    skipBreak,
    startNext,
  };
}
import { useState, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import './App.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function App() {
  const {
    phase, timeLeft, sessions, progress, dailyGoal, setDailyGoal,
    currentStreak,
    start, pause, resume, reset,
    startBreak, skipBreak, startNext,
  } = useTimer();

  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [pickerGoal, setPickerGoal] = useState(4);

  useEffect(() => {
    if (!localStorage.getItem('focusGoal')) {
      setShowGoalPicker(true);
    }
  }, []);

  const confirmGoal = () => {
    localStorage.setItem('focusGoal', String(pickerGoal));
    setDailyGoal(pickerGoal);
    setShowGoalPicker(false);
  };

  const isBreak = ['sessionComplete', 'breakIdle', 'breakRunning', 'breakComplete'].includes(phase);
  const showReset = phase === 'running' || phase === 'paused';
  const showSkip = ['sessionComplete', 'breakIdle', 'breakRunning', 'breakComplete'].includes(phase);
  const goalReached = sessions > 0 && sessions >= dailyGoal;

  const modeBadge = (phase === 'idle' && goalReached)
    ? { label: 'Goal reached', cls: 'badge-done' }
    : {
      idle:            { label: 'Focus',        cls: 'badge-focus' },
      running:         { label: 'Focus',        cls: 'badge-focus' },
      paused:          { label: 'Focus',        cls: 'badge-focus' },
      sessionComplete: { label: 'Session done', cls: 'badge-done'  },
      breakIdle:       { label: 'Break',        cls: 'badge-break' },
      breakRunning:    { label: 'Break',        cls: 'badge-break' },
      breakComplete:   { label: 'Break done',   cls: 'badge-done'  },
    }[phase];

  const subLabel = (phase === 'idle' && goalReached)
    ? `All ${dailyGoal} sessions done for today. Rest up.`
    : {
      idle:            'Ready when you are',
      running:         'Stay locked in',
      paused:          'Paused — clock is stopped',
      sessionComplete: 'Take a breath',
      breakIdle:       'Step away from the screen',
      breakRunning:    'Break running',
      breakComplete:   'Break complete',
    }[phase];

  const primaryBtn = {
    idle:            { label: 'Start focus',  action: start,      cls: 'btn-purple' },
    running:         { label: 'Pause',        action: pause,      cls: 'btn-purple' },
    paused:          { label: 'Resume',       action: resume,     cls: 'btn-purple' },
    sessionComplete: { label: 'Start break',  action: startBreak, cls: 'btn-green'  },
    breakIdle:       { label: 'Start break',  action: startBreak, cls: 'btn-green'  },
    breakRunning:    { label: 'Pause',        action: pause,      cls: 'btn-green'  },
    breakComplete:   { label: goalReached ? 'Done for today' : 'Next session', action: startNext, cls: 'btn-purple' },
  }[phase];

  const ringOffset = Math.round(377 * (1 - Math.min(sessions / dailyGoal, 1)));
  const streakAtRisk = sessions === 0 && currentStreak > 0 && new Date().getHours() >= 18;

  if (showGoalPicker) {
    return (
      <div className="app">
        <div className="card">
          <div className="picker-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#534ab7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 className="picker-heading">Set your daily goal</h2>
          <p className="picker-sub">How many focus sessions will you aim for each day?</p>
          <div className="picker-row">
            <button className="picker-btn" onClick={() => setPickerGoal(g => Math.max(1, g - 1))}>−</button>
            <span className="picker-number">{pickerGoal}</span>
            <button className="picker-btn" onClick={() => setPickerGoal(g => Math.min(8, g + 1))}>+</button>
          </div>
          <p className="picker-hint">
            {pickerGoal} sessions · about {(pickerGoal * 25 / 60).toFixed(1)} hours of focused work
          </p>
          <button className="btn btn-primary btn-purple picker-start" onClick={confirmGoal}>
            Start focusing →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="card">
        <div className="card-top-row">
          <div className={`streak-chip${streakAtRisk ? ' streak-chip--risk' : ''}`}>
            🔥 {currentStreak} day streak
          </div>
          <div />
        </div>
        <span className={`badge ${modeBadge.cls}`}>{modeBadge.label}</span>

        <div className="ring-wrap">
          <svg width="144" height="144" viewBox="0 0 144 144">
            <circle
              cx="72" cy="72" r="60"
              fill="none"
              stroke="#e8e6e0"
              strokeWidth="8"
            />
            <circle
              cx="72" cy="72" r="60"
              fill="none"
              stroke="#534ab7"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="377"
              strokeDashoffset={ringOffset}
              transform="rotate(-90 72 72)"
            />
          </svg>
          <div className="ring-centre">
            <span className="ring-main">{sessions}/{dailyGoal}</span>
            <span className="ring-sub">sessions today</span>
          </div>
        </div>

        {phase === 'sessionComplete'
          ? <div className="complete-msg">Session complete!</div>
          : <div className="timer">{formatTime(timeLeft)}</div>
        }

        <p className="sub-label">{subLabel}</p>

        <div className="progress-track">
          <div
            className={`progress-fill ${isBreak ? 'bar-green' : 'bar-purple'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {phase === 'idle' && goalReached ? (
          <div className="goal-done">
            <p className="goal-done-msg">You hit your goal for today. See you tomorrow.</p>
          </div>
        ) : (
          <div className="controls">
            {showReset && (
              <button className="btn btn-secondary" onClick={reset}>↺ Reset</button>
            )}
            <button className={`btn btn-primary ${primaryBtn.cls}`} onClick={primaryBtn.action}>
              {primaryBtn.label}
            </button>
            {showSkip && (
              <button className="btn btn-ghost" onClick={skipBreak}>Skip break</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

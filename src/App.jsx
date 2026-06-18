import { useTimer } from './hooks/useTimer';
import './App.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function App() {
  const {
    phase, timeLeft, sessions, progress,
    start, pause, resume, reset,
    startBreak, skipBreak, startNext,
  } = useTimer();

  const isBreak = phase === 'breakRunning' || phase === 'sessionComplete' || phase === 'breakIdle' || phase === 'breakComplete';
  const showReset = phase === 'running' || phase === 'paused';
  const showSkip = phase === 'sessionComplete' || phase === 'breakIdle' || phase === 'breakRunning' || phase === 'breakComplete';

  const modeBadge = {
    idle:            { label: 'Focus',        cls: 'badge-focus' },
    running:         { label: 'Focus',        cls: 'badge-focus' },
    paused:          { label: 'Focus',        cls: 'badge-focus' },
    sessionComplete: { label: 'Session done', cls: 'badge-done'  },
    breakIdle:       { label: 'Break',        cls: 'badge-break' },
    breakRunning:    { label: 'Break',        cls: 'badge-break' },
    breakComplete:   { label: 'Break done',   cls: 'badge-done'  },
  }[phase];

  const subLabel = {
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
    breakComplete:   { label: 'Next session', action: startNext,  cls: 'btn-purple' },
  }[phase];

  return (
    <div className="app">
      <div className="card">
        <span className={`badge ${modeBadge.cls}`}>{modeBadge.label}</span>

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

        <div className="sessions">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`dot ${i <= sessions ? 'dot-filled' : ''}`} />
          ))}
          <span className="session-label">
            {sessions === 1 ? '1 session today' : `${sessions} sessions today`}
          </span>
        </div>
      </div>
    </div>
  );
}

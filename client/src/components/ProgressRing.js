import React from 'react';

export default function ProgressRing({
  completed = 0,
  total = 0,
  size = 120,
  strokeWidth = 10,
  color = '#6366f1',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-ring-card">
      <div className="progress-ring-visual" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="progress-ring-svg">
          {/* Background circle */}
          <circle
            className="progress-ring-bg"
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            className="progress-ring-circle"
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset: offset }}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="progress-ring-inner-text">
          <span className="progress-ring-pct">{percentage}%</span>
        </div>
      </div>

      <div className="progress-ring-details">
        <h3 className="progress-ring-title">Today's Progress</h3>
        <p className="progress-ring-subtitle">
          <strong>{completed}</strong> of <strong>{total}</strong> habits completed
        </p>
        <div className="progress-ring-motivation">
          {percentage === 100 && total > 0
            ? '🎉 Incredible job! All habits completed today!'
            : percentage >= 50
            ? '⚡ Over halfway there! Keep pushing!'
            : total === 0
            ? '🌱 Add a habit below to start your streak!'
            : '💪 Small steps every day lead to giant changes!'}
        </div>
      </div>
    </div>
  );
}

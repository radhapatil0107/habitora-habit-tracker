import React, { useMemo } from 'react';

const BADGES_CONFIG = [
  {
    id: 'first-checkin',
    title: 'First Step',
    description: 'Complete your first habit check-in.',
    icon: '🌱',
    color: '#10b981',
    check: (habits, totalCheckins) => totalCheckins >= 1,
  },
  {
    id: 'streak-3',
    title: 'Momentum Builder',
    description: 'Achieve a 3-day streak on any habit.',
    icon: '🔥',
    color: '#f59e0b',
    check: (habits) => habits.some((h) => (h.streak || 0) >= 3),
  },
  {
    id: 'streak-7',
    title: 'Unstoppable Week',
    description: 'Maintain a 7-day streak on any habit.',
    icon: '⚡',
    color: '#8b5cf6',
    check: (habits) => habits.some((h) => (h.streak || 0) >= 7),
  },
  {
    id: 'streak-30',
    title: 'Monthly Legend',
    description: 'Reach an extraordinary 30-day streak.',
    icon: '👑',
    color: '#ec4899',
    check: (habits) => habits.some((h) => (h.streak || 0) >= 30),
  },
  {
    id: 'builder-5',
    title: 'Habit Architect',
    description: 'Create and organize 5 or more unique habits.',
    icon: '🏛️',
    color: '#3b82f6',
    check: (habits) => habits.length >= 5,
  },
  {
    id: 'all-done-today',
    title: 'Daily Champion',
    description: 'Complete every single one of your daily habits in one day.',
    icon: '🏆',
    color: '#6366f1',
    check: (habits) => {
      if (habits.length === 0) return false;
      const today = new Date().toISOString().split('T')[0];
      return habits.every((h) => h.completedDates && h.completedDates.includes(today));
    },
  },
];

export default function Badges({ habits = [] }) {
  const totalCheckins = useMemo(() => {
    return habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0);
  }, [habits]);

  const evaluatedBadges = useMemo(() => {
    return BADGES_CONFIG.map((b) => {
      const unlocked = b.check(habits, totalCheckins);
      return {
        ...b,
        unlocked,
      };
    });
  }, [habits, totalCheckins]);

  const unlockedCount = evaluatedBadges.filter((b) => b.unlocked).length;

  return (
    <div className="badges-page">
      <div className="page-header">
        <h2>🏆 Milestone & Achievement Badges</h2>
        <p>Unlock awards as you build discipline, maintain streaks, and reach daily consistency.</p>
      </div>

      {/* Progress banner */}
      <div className="badge-progress-banner">
        <div className="badge-progress-text">
          <span className="badge-count-highlight">
            {unlockedCount} of {BADGES_CONFIG.length}
          </span>{' '}
          Achievements Unlocked
        </div>
        <div className="badge-progress-bar-track">
          <div
            className="badge-progress-bar-fill"
            style={{ width: `${(unlockedCount / BADGES_CONFIG.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="badges-grid">
        {evaluatedBadges.map((badge) => {
          return (
            <div
              key={badge.id}
              className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
              style={badge.unlocked ? { borderColor: badge.color } : {}}
            >
              <div
                className="badge-icon-wrap"
                style={badge.unlocked ? { backgroundColor: `${badge.color}25` } : {}}
              >
                <span className="badge-emoji">{badge.icon}</span>
                {!badge.unlocked && <span className="lock-tag">🔒</span>}
              </div>

              <div className="badge-info">
                <h4 className="badge-title">{badge.title}</h4>
                <p className="badge-description">{badge.description}</p>
              </div>

              <div className="badge-status-footer">
                {badge.unlocked ? (
                  <span className="status-unlocked" style={{ color: badge.color }}>
                    ✓ Unlocked
                  </span>
                ) : (
                  <span className="status-locked">In Progress</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

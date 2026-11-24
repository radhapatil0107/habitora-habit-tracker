import React from 'react';

export default function WeeklyStreakBar({ completedDates = [], color = '#6366f1' }) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const now = new Date();
  const currentDayIndex = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const todayStr = now.toISOString().split('T')[0];

  // Calculate dates for Monday through Sunday of current week
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayIndex);

  const weekDays = daysOfWeek.map((dayName, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    const isCompleted = completedDates.includes(dateStr);
    const isToday = dateStr === todayStr;
    const isFuture = idx > currentDayIndex;

    return {
      name: dayName,
      dateStr,
      isCompleted,
      isToday,
      isFuture,
    };
  });

  return (
    <div className="weekly-streak-bar">
      <div className="streak-bar-label">This Week</div>
      <div className="streak-bar-days">
        {weekDays.map((d) => {
          let dotStyle = {};
          let className = 'streak-day-dot';

          if (d.isCompleted) {
            className += ' completed';
            dotStyle = { backgroundColor: color, borderColor: color };
          } else if (d.isFuture) {
            className += ' future';
          } else {
            className += ' incomplete';
          }

          if (d.isToday) {
            className += ' today';
          }

          return (
            <div key={d.name} className="streak-day-item">
              <span className="streak-day-name">{d.name}</span>
              <div
                className={className}
                style={dotStyle}
                title={`${d.name} (${d.dateStr}): ${
                  d.isCompleted ? 'Completed' : d.isFuture ? 'Upcoming' : 'Missed'
                }`}
              >
                {d.isCompleted ? '✓' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

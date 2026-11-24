import React, { useState, useMemo } from 'react';

export default function History({ habits = [] }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Map of dateStr -> array of completed habit objects
  const dateCompletionMap = useMemo(() => {
    const map = {};
    for (const h of habits) {
      if (!h.completedDates) continue;
      for (const d of h.completedDates) {
        if (!map[d]) map[d] = [];
        map[d].push({
          id: h._id,
          name: h.name,
          icon: h.icon || '🎯',
          color: h.color || '#6366f1',
          category: h.category || 'Other',
          note: h.note || '',
        });
      }
    }
    return map;
  }, [habits]);

  // 12-week GitHub style heatmap (84 days ending today)
  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = dateCompletionMap[dateStr]?.length || 0;
      days.push({
        date: d,
        dateStr,
        count,
      });
    }
    return days;
  }, [dateCompletionMap]);

  // Month navigation helpers
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  // Calendar cells for current month
  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday as 0: (day + 6) % 7
    const startOffset = (firstDay.getDay() + 6) % 7;
    const cells = [];

    // Empty placeholder cells before 1st of month
    for (let i = 0; i < startOffset; i++) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = dateObj.toISOString().split('T')[0];
      const completedList = dateCompletionMap[dateStr] || [];
      const count = completedList.length;

      cells.push({
        type: 'day',
        dayNumber: d,
        dateStr,
        count,
        habits: completedList,
        isToday: dateStr === todayStr,
        key: dateStr,
      });
    }

    return cells;
  }, [year, month, dateCompletionMap]);

  const selectedHabits = selectedDate ? dateCompletionMap[selectedDate] || [] : [];

  return (
    <div className="history-page">
      {/* Page Title */}
      <div className="page-header">
        <h2>📅 Habit Completion History</h2>
        <p>Explore your consistency across time with monthly calendars and activity heatmaps.</p>
      </div>

      {/* GitHub-style Heatmap Section */}
      <div className="history-card heatmap-section">
        <div className="card-heading-row">
          <h3>🔥 12-Week Activity Heatmap</h3>
          <span className="card-badge">Last 84 days</span>
        </div>

        <div className="heatmap-grid-wrapper">
          <div className="heatmap-grid">
            {heatmapDays.map((cell) => {
              let level = 'level-0';
              if (cell.count >= 4) level = 'level-4';
              else if (cell.count === 3) level = 'level-3';
              else if (cell.count === 2) level = 'level-2';
              else if (cell.count === 1) level = 'level-1';

              return (
                <div
                  key={cell.dateStr}
                  className={`heatmap-cell ${level} ${selectedDate === cell.dateStr ? 'selected' : ''}`}
                  title={`${cell.dateStr}: ${cell.count} habits completed`}
                  onClick={() => setSelectedDate(cell.dateStr)}
                />
              );
            })}
          </div>

          <div className="heatmap-legend">
            <span>Less</span>
            <div className="legend-cell level-0" />
            <div className="legend-cell level-1" />
            <div className="legend-cell level-2" />
            <div className="legend-cell level-3" />
            <div className="legend-cell level-4" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Calendar & Day Details Section */}
      <div className="history-bottom-row">
        {/* Monthly Calendar Section */}
        <div className="history-card calendar-section">
          <div className="calendar-controls">
            <button type="button" className="btn-cal-nav" onClick={prevMonth}>
              ‹ Prev
            </button>
            <h3 className="current-month-heading">{monthName}</h3>
            <button type="button" className="btn-cal-nav" onClick={nextMonth}>
              Next ›
            </button>
          </div>

          <div className="calendar-week-headers">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="calendar-week-header">
                {d}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarCells.map((cell) => {
              if (cell.type === 'empty') {
                return <div key={cell.key} className="calendar-cell empty" />;
              }

              let intensityClass = 'cell-none';
              if (cell.count >= 3) intensityClass = 'cell-high';
              else if (cell.count === 2) intensityClass = 'cell-medium';
              else if (cell.count === 1) intensityClass = 'cell-low';

              const isSelected = selectedDate === cell.dateStr;

              return (
                <div
                  key={cell.key}
                  className={`calendar-cell day ${intensityClass} ${
                    cell.isToday ? 'today' : ''
                  } ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  title={`${cell.dateStr}: ${cell.count} habits done`}
                >
                  <span className="cal-day-num">{cell.dayNumber}</span>
                  {cell.count > 0 && (
                    <span className="cal-check-badge">
                      {cell.count}✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Card */}
        {selectedDate ? (
          <div className="history-card selected-date-card">
            <div className="selected-date-header">
              <h4>
                📋 Completed on{' '}
                <span className="highlight-date">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </h4>
              <button
                type="button"
                className="btn-close-date-view"
                onClick={() => setSelectedDate(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {selectedHabits.length === 0 ? (
              <div className="no-completions-box">
                <span className="empty-day-icon">💤</span>
                <p className="no-completions-msg">No habits recorded on this day.</p>
              </div>
            ) : (
              <div className="completed-habits-list">
                {selectedHabits.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="completed-habit-item"
                    style={{ borderLeftColor: item.color }}
                  >
                    <span className="habit-icon">{item.icon}</span>
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-category-tag">{item.category}</span>
                      {item.note && <p className="item-note">"{item.note}"</p>}
                    </div>
                    <span className="completed-check-icon">✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="history-card calendar-placeholder-card">
            <span className="placeholder-icon">👆</span>
            <h4>Select a Day</h4>
            <p>Click on any date in the calendar or heatmap above to view your completed habits and notes.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { getStats } from '../services/api';

export default function Stats({ habits = [] }) {
  const [apiStats, setApiStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getStats();
        setApiStats(res.data);
      } catch (err) {
        console.error('Stats endpoint error:', err);
      }
    }
    loadStats();
  }, [habits]);

  // Compute best day of week & day-by-day distribution
  const dayDistribution = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    for (const h of habits) {
      if (!h.completedDates) continue;
      for (const dStr of h.completedDates) {
        const d = new Date(dStr + 'T00:00:00');
        const dayIdx = d.getDay();
        counts[dayIdx] += 1;
      }
    }

    const maxCount = Math.max(...counts, 1);
    let bestDayIdx = 0;
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] > counts[bestDayIdx]) bestDayIdx = i;
    }

    return {
      days: days.map((name, i) => ({
        name: name.slice(0, 3),
        fullName: name,
        count: counts[i],
        percentage: Math.round((counts[i] / maxCount) * 100),
      })),
      bestDay: counts[bestDayIdx] > 0 ? days[bestDayIdx] : 'None yet',
    };
  }, [habits]);

  // Category breakdown calculation
  const categoryStats = useMemo(() => {
    const categories = ['Health', 'Study', 'Hobby', 'Work', 'Other'];
    const counts = {};
    for (const c of categories) counts[c] = 0;

    for (const h of habits) {
      const cat = h.category || 'Other';
      if (counts[cat] !== undefined) counts[cat] += 1;
      else counts['Other'] += 1;
    }

    const total = habits.length || 1;
    return categories.map((cat) => ({
      category: cat,
      count: counts[cat],
      pct: Math.round((counts[cat] / total) * 100),
    }));
  }, [habits]);

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(habits, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `habits_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Frequency', 'CurrentStreak', 'Color', 'CompletedDatesCount', 'CompletedDates'];
    const rows = habits.map((h) => [
      h._id,
      `"${(h.name || '').replace(/"/g, '""')}"`,
      h.category || 'Other',
      h.frequency || 'daily',
      h.streak || 0,
      h.color || '#6366f1',
      h.completedDates?.length || 0,
      `"${(h.completedDates || []).join(';')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `habits_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const currentStreak = apiStats?.currentBestStreak ?? Math.max(...habits.map((h) => h.streak || 0), 0);
  const longestStreak = apiStats?.longestStreak ?? currentStreak;
  const totalCheckins = apiStats?.totalCheckins ?? habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0);
  const weeklyRate = apiStats?.weeklyRate ?? 0;
  const monthlyRate = apiStats?.monthlyRate ?? 0;

  return (
    <div className="stats-page">
      <div className="page-header">
        <h2>📊 Habit Performance Analytics</h2>
        <p>In-depth insights, streak analyses, and productivity trends.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">🔥</div>
          <div className="kpi-content">
            <span className="kpi-value">{currentStreak}</span>
            <span className="kpi-label">Current Best Streak</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🏆</div>
          <div className="kpi-content">
            <span className="kpi-value">{longestStreak}</span>
            <span className="kpi-label">All-time Longest Streak</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <span className="kpi-value">{totalCheckins}</span>
            <span className="kpi-label">Total Check-Ins</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">⭐</div>
          <div className="kpi-content">
            <span className="kpi-value">{dayDistribution.bestDay}</span>
            <span className="kpi-label">Most Productive Day</span>
          </div>
        </div>
      </div>

      {/* Rates Row */}
      <div className="rates-row">
        <div className="rate-card">
          <h4>Weekly Consistency Rate</h4>
          <div className="rate-number-wrap">
            <span className="rate-number">{weeklyRate}%</span>
          </div>
          <p className="rate-desc">Proportion of active habits maintained in the current week.</p>
        </div>

        <div className="rate-card">
          <h4>Monthly Consistency Rate</h4>
          <div className="rate-number-wrap">
            <span className="rate-number">{monthlyRate}%</span>
          </div>
          <p className="rate-desc">Proportion of habits completed at least once this calendar month.</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Day of Week Histogram */}
        <div className="stats-chart-card">
          <h3>📅 Check-Ins by Day of Week</h3>
          <div className="bar-chart-vertical">
            {dayDistribution.days.map((d) => (
              <div key={d.name} className="chart-col">
                <div className="chart-bar-wrap">
                  <div
                    className="chart-bar-fill"
                    style={{ height: `${Math.max(d.percentage, 6)}%` }}
                    title={`${d.fullName}: ${d.count} check-ins`}
                  />
                </div>
                <span className="chart-bar-label">{d.name}</span>
                <span className="chart-bar-value">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown Horizontal Bars */}
        <div className="stats-chart-card">
          <h3>🏷️ Habits by Category</h3>
          <div className="category-bars-list">
            {categoryStats.map((item) => (
              <div key={item.category} className="cat-bar-row">
                <div className="cat-bar-meta">
                  <span className="cat-bar-name">{item.category}</span>
                  <span className="cat-bar-count">
                    {item.count} {item.count === 1 ? 'habit' : 'habits'} ({item.pct}%)
                  </span>
                </div>
                <div className="cat-bar-track">
                  <div
                    className={`cat-bar-fill cat-${item.category.toLowerCase()}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="export-section-card">
        <div className="export-meta">
          <h3>📦 Export Your Habit Data</h3>
          <p>
            Download your entire tracking history and configurations as CSV for spreadsheet analysis
            or JSON for automated backups.
          </p>
        </div>
        <div className="export-buttons-group">
          <button type="button" className="btn-export btn-export-csv" onClick={handleExportCSV}>
            📥 Export as CSV
          </button>
          <button type="button" className="btn-export btn-export-json" onClick={handleExportJSON}>
            📥 Export as JSON
          </button>
        </div>
      </div>
    </div>
  );
}

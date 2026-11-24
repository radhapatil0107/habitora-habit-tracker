import React, { useState } from 'react';
import WeeklyStreakBar from './WeeklyStreakBar';

export default function HabitCard({
  habit,
  onCheckin,
  onUndoCheckin,
  onEdit,
  onDelete,
}) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const isDoneToday = habit.completedDates && habit.completedDates.includes(today);

  const streak = habit.streak || 0;
  // Flame size scaling
  let flameClass = 'flame-small';
  if (streak >= 7) {
    flameClass = 'flame-large flame-pulse';
  } else if (streak >= 3) {
    flameClass = 'flame-medium';
  }

  const handleCheckinClick = () => {
    if (isDoneToday) {
      onUndoCheckin(habit._id);
    } else {
      onCheckin(habit._id, note);
      setNote('');
      setShowNoteInput(false);
    }
  };

  return (
    <div
      className="habit-card"
      style={{
        borderTopColor: habit.color || '#6366f1',
      }}
    >
      {/* Top Header: Icon + Name + Category + Actions */}
      <div className="habit-card-header">
        <div className="habit-card-identity">
          <span className="habit-card-icon" style={{ backgroundColor: `${habit.color}20` }}>
            {habit.icon || '🎯'}
          </span>
          <div className="habit-card-titles">
            <h4 className="habit-card-name">{habit.name}</h4>
            <div className="habit-badges-row">
              <span className="badge-frequency">{habit.frequency || 'daily'}</span>
              <span className="badge-category">{habit.category || 'Other'}</span>
            </div>
          </div>
        </div>

        <div className="habit-card-top-actions">
          <button
            type="button"
            className="btn-icon-action btn-edit-habit"
            onClick={() => onEdit(habit)}
            title="Edit habit"
            aria-label="Edit habit"
          >
            ✏️
          </button>
          <button
            type="button"
            className="btn-icon-action btn-delete-habit"
            onClick={() => onDelete(habit)}
            title="Delete habit"
            aria-label="Delete habit"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Description */}
      {habit.description && (
        <p className="habit-card-description">{habit.description}</p>
      )}

      {/* Streak info */}
      <div className="habit-card-streak-row">
        <div className={`streak-badge ${flameClass}`}>
          <span className="flame-emoji">🔥</span>
          <span className="streak-count">{streak}</span>
          <span className="streak-unit">{streak === 1 ? 'day streak' : 'days streak'}</span>
        </div>

        {streak >= 7 && (
          <span className="streak-milestone" title="7+ day streak achieved!">
            ⚡ On Fire!
          </span>
        )}
      </div>

      {/* Weekly Streak Bar (Mon - Sun) */}
      <WeeklyStreakBar
        completedDates={habit.completedDates || []}
        color={habit.color || '#6366f1'}
      />

      {/* Optional Note input (expandable before check-in) */}
      {!isDoneToday && showNoteInput && (
        <div className="habit-note-box">
          <input
            type="text"
            className="habit-note-input"
            placeholder="Add note (e.g. Ran 3km, read chapter 2)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={100}
          />
        </div>
      )}

      {/* Checkin Note Display if done today and had a note */}
      {isDoneToday && habit.note && (
        <div className="habit-saved-note">
          <span className="note-pin">📝</span> "{habit.note}"
        </div>
      )}

      {/* Card Action Button */}
      <div className="habit-card-bottom">
        {!isDoneToday && (
          <button
            type="button"
            className="btn-toggle-note"
            onClick={() => setShowNoteInput(!showNoteInput)}
            title={showNoteInput ? 'Cancel note' : 'Add check-in note'}
          >
            {showNoteInput ? 'Cancel Note' : '+ Note'}
          </button>
        )}

        <button
          type="button"
          className={`btn-checkin-action ${isDoneToday ? 'btn-done-today' : 'btn-checkin-now'}`}
          onClick={handleCheckinClick}
          style={
            !isDoneToday
              ? { background: `linear-gradient(135deg, ${habit.color || '#6366f1'}, #4f46e5)` }
              : {}
          }
        >
          {isDoneToday ? (
            <>
              <span className="check-icon">✓</span> Done Today{' '}
              <span className="undo-hint">(click to undo)</span>
            </>
          ) : (
            <>
              <span className="check-icon">✔</span> Check In
            </>
          )}
        </button>
      </div>
    </div>
  );
}

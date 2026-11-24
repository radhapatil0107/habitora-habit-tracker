import React, { useState, useMemo } from 'react';
import ProgressRing from '../components/ProgressRing';
import SearchFilter from '../components/SearchFilter';
import AddHabitForm from '../components/AddHabitForm';
import HabitCard from '../components/HabitCard';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';

const MOTIVATIONAL_QUOTES = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "Motivation gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "First make your habits, then your habits make you.", author: "John Dryden" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
];

export default function Dashboard({
  habits = [],
  loading = false,
  onAddHabit,
  onEditHabit,
  onRemoveHabit,
  onCheckin,
  onUndoCheckin,
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');

  // Modal states
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);

  // Quote of the day (stable per render date)
  const quote = useMemo(() => {
    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const completedTodayCount = habits.filter(
    (h) => h.completedDates && h.completedDates.includes(today)
  ).length;

  // Filtered and sorted habits
  const filteredHabits = useMemo(() => {
    return habits
      .filter((h) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = h.name.toLowerCase().includes(q);
          const matchDesc = (h.description || '').toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }

        // Status / Frequency filter
        const isDone = h.completedDates && h.completedDates.includes(today);
        if (filter === 'daily' && h.frequency !== 'daily') return false;
        if (filter === 'weekly' && h.frequency !== 'weekly') return false;
        if (filter === 'done' && !isDone) return false;
        if (filter === 'pending' && isDone) return false;

        // Category filter
        if (category !== 'All' && (h.category || 'Other') !== category) return false;

        return true;
      })
      .sort((a, b) => {
        if (sort === 'streak') {
          return (b.streak || 0) - (a.streak || 0);
        }
        if (sort === 'name') {
          return a.name.localeCompare(b.name);
        }
        // Newest first (default)
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [habits, search, filter, category, sort, today]);

  const confirmDelete = async () => {
    if (deletingHabit) {
      await onRemoveHabit(deletingHabit._id);
      setDeletingHabit(null);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Motivational Quote Banner */}
      <div className="quote-banner">
        <span className="quote-icon">“</span>
        <div className="quote-content">
          <p className="quote-text">{quote.text}</p>
          <span className="quote-author">— {quote.author}</span>
        </div>
      </div>

      {/* Progress Ring Summary */}
      <ProgressRing
        completed={completedTodayCount}
        total={habits.length}
        size={110}
        color="#6366f1"
      />

      {/* Add Habit Collapsible Form */}
      <AddHabitForm onAdd={onAddHabit} />

      {/* Search, Filter, Sort Controls */}
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        category={category}
        onCategoryChange={setCategory}
      />

      {/* Habits Grid / Loading / Empty State */}
      <div className="habits-section">
        <div className="habits-section-header">
          <h3 className="section-title">
            Your Habits
            <span className="count-pill">{filteredHabits.length}</span>
          </h3>
        </div>

        {loading ? (
          <div className="skeleton-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card" />
            ))}
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">📋</div>
            <h4>No habits found</h4>
            <p>
              {habits.length === 0
                ? "You haven't created any habits yet! Click the button above to begin your journey."
                : 'No habits match your active filters. Try clearing the search or category filter.'}
            </p>
          </div>
        ) : (
          <div className="habits-grid">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onCheckin={onCheckin}
                onUndoCheckin={onUndoCheckin}
                onEdit={setEditingHabit}
                onDelete={setDeletingHabit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingHabit && (
        <EditModal
          habit={editingHabit}
          onSave={onEditHabit}
          onClose={() => setEditingHabit(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingHabit && (
        <DeleteModal
          habitName={deletingHabit.name}
          onConfirm={confirmDelete}
          onClose={() => setDeletingHabit(null)}
        />
      )}
    </div>
  );
}

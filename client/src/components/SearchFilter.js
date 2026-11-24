import React from 'react';

export default function SearchFilter({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  category,
  onCategoryChange,
}) {
  const filterChips = [
    { id: 'all', label: 'All Habits' },
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'done', label: 'Done Today' },
    { id: 'pending', label: 'Pending' },
  ];

  const categories = ['All', 'Health', 'Study', 'Hobby', 'Work', 'Other'];

  return (
    <div className="search-filter-container">
      {/* Search Input & Sort Controls */}
      <div className="search-sort-row">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search habits by name or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              type="button"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="sort-wrapper">
          <label htmlFor="habit-sort-select" className="sort-label">Sort by:</label>
          <select
            id="habit-sort-select"
            className="sort-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="streak">Highest Streak 🔥</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Status & Frequency Filters */}
      <div className="filter-chips-row">
        <div className="filter-chips-group">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={`filter-chip ${filter === chip.id ? 'active' : ''}`}
              onClick={() => onFilterChange(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Chips */}
      <div className="category-chips-row">
        <span className="category-filter-label">Category:</span>
        <div className="category-chips-group">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-chip ${category === cat ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

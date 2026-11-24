import React, { useState } from 'react';

const COMMON_EMOJIS = [
  '🎯', '💪', '📚', '🏃‍♀️', '🧘‍♀️', '💤', '🥗', '🎨',
  '🎵', '📝', '🌱', '🏋️‍♂️', '🚴‍♀️', '🤸‍♀️', '📖', '🎮',
  '🍎', '💊', '🌅', '🧹', '💧', '🧠', '✨', '💻'
];

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#3b82f6', // Blue
];

export default function AddHabitForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [category, setCategory] = useState('Health');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('🎯');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const success = await onAdd({
      name: name.trim(),
      description: description.trim(),
      frequency,
      category,
      color,
      icon,
    });
    setSubmitting(false);

    if (success) {
      setName('');
      setDescription('');
      setFrequency('daily');
      setCategory('Health');
      setColor('#6366f1');
      setIcon('🎯');
      setIsOpen(false);
      setShowEmojiPicker(false);
    }
  };

  return (
    <div className="add-habit-wrapper">
      {!isOpen ? (
        <button
          type="button"
          className="btn-toggle-add"
          onClick={() => setIsOpen(true)}
        >
          <span className="plus-icon">+</span> Create New Habit
        </button>
      ) : (
        <div className="add-habit-card">
          <div className="add-habit-header">
            <h3>✨ Create a New Habit</h3>
            <button
              type="button"
              className="btn-close-form"
              onClick={() => setIsOpen(false)}
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="add-habit-form-body">
            {/* Name & Icon Row */}
            <div className="form-group-row">
              <div className="icon-select-wrapper">
                <label className="form-label">Icon</label>
                <button
                  type="button"
                  className="icon-picker-btn"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Choose an icon"
                >
                  <span className="selected-icon">{icon}</span>
                </button>

                {showEmojiPicker && (
                  <div className="emoji-dropdown-grid">
                    {COMMON_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`emoji-btn ${icon === emoji ? 'selected' : ''}`}
                        onClick={() => {
                          setIcon(emoji);
                          setShowEmojiPicker(false);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="name-input-wrapper">
                <label className="form-label" htmlFor="habit-name-input">
                  Habit Name <span className="required-star">*</span>
                </label>
                <input
                  id="habit-name-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Read 20 pages, Morning Jog, Meditate..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="habit-desc-input">
                Description / Purpose (optional)
              </label>
              <input
                id="habit-desc-input"
                type="text"
                className="form-input"
                placeholder="Why do you want to build this habit?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Frequency & Category */}
            <div className="form-row-two-col">
              <div className="form-group">
                <label className="form-label" htmlFor="habit-freq-select">Frequency</label>
                <select
                  id="habit-freq-select"
                  className="form-select"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="daily">Daily Goal</option>
                  <option value="weekly">Weekly Target</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="habit-cat-select">Category</label>
                <select
                  id="habit-cat-select"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Health">Health & Wellness</option>
                  <option value="Study">Study & Learning</option>
                  <option value="Hobby">Hobby & Creativity</option>
                  <option value="Work">Work & Career</option>
                  <option value="Other">Other / Personal</option>
                </select>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="form-group">
              <label className="form-label">Theme Color</label>
              <div className="color-swatches">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-swatch-btn ${color === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    title={c}
                  />
                ))}
                <input
                  type="color"
                  className="custom-color-input"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  title="Custom Color"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !name.trim()}
              >
                {submitting ? 'Creating...' : 'Create Habit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

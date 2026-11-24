import React, { useState, useEffect } from 'react';

const COMMON_EMOJIS = [
  '🎯', '💪', '📚', '🏃‍♀️', '🧘‍♀️', '💤', '🥗', '🎨',
  '🎵', '📝', '🌱', '🏋️‍♂️', '🚴‍♀️', '🤸‍♀️', '📖', '🎮',
  '🍎', '💊', '🌅', '🧹', '💧', '🧠', '✨', '💻'
];

const PRESET_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#8b5cf6', '#ef4444', '#3b82f6',
];

export default function EditModal({ habit, onSave, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [category, setCategory] = useState('Other');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('🎯');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setDescription(habit.description || '');
      setFrequency(habit.frequency || 'daily');
      setCategory(habit.category || 'Other');
      setColor(habit.color || '#6366f1');
      setIcon(habit.icon || '🎯');
    }
  }, [habit]);

  if (!habit) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const success = await onSave(habit._id, {
      name: name.trim(),
      description: description.trim(),
      frequency,
      category,
      color,
      icon,
    });
    setSaving(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✏️ Edit Habit</h3>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Icon & Name */}
          <div className="form-group-row">
            <div className="icon-select-wrapper">
              <label className="form-label">Icon</label>
              <button
                type="button"
                className="icon-picker-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
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
              <label className="form-label" htmlFor="edit-habit-name">
                Habit Name <span className="required-star">*</span>
              </label>
              <input
                id="edit-habit-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-habit-desc">Description</label>
            <input
              id="edit-habit-desc"
              type="text"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Frequency & Category */}
          <div className="form-row-two-col">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-habit-freq">Frequency</label>
              <select
                id="edit-habit-freq"
                className="form-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-habit-cat">Category</label>
              <select
                id="edit-habit-cat"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Health">Health</option>
                <option value="Study">Study</option>
                <option value="Hobby">Hobby</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Color */}
          <div className="form-group">
            <label className="form-label">Color</label>
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
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving || !name.trim()}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

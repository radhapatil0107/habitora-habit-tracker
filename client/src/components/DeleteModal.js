import React from 'react';

export default function DeleteModal({ habitName, onConfirm, onClose }) {
  if (!habitName) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-icon">⚠️</div>
        <h3 className="delete-modal-title">Delete Habit?</h3>
        <p className="delete-modal-text">
          Are you sure you want to delete <strong>"{habitName}"</strong>?
          All your streak records and completion history for this habit will be permanently removed.
        </p>

        <div className="modal-actions delete-modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
          >
            Yes, Delete Habit
          </button>
        </div>
      </div>
    </div>
  );
}

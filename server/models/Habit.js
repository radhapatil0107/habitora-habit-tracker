const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    // Array of dates when the habit was completed e.g. ["2026-11-18", "2026-11-19"]
    completedDates: {
      type: [String],
      default: [],
    },
    streak: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '#6366f1', // default indigo color
    },
    // ── New fields ────────────────────────────────────────────
    icon: {
      type: String,
      default: '🎯',
    },
    category: {
      type: String,
      enum: ['Health', 'Study', 'Hobby', 'Work', 'Other'],
      default: 'Other',
    },
    note: {
      type: String,
      default: '', // last check-in note
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('Habit', habitSchema);

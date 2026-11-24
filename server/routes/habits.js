const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// ── Helper: Calculate streak from completedDates ─────────────────────────────
// Sorts dates descending, counts consecutive days ending today or yesterday.
function calculateStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;

  // Deduplicate and sort descending
  const sorted = [...new Set(completedDates)].sort((a, b) => (a < b ? 1 : -1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Streak must include today or yesterday to be active
  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;

  let streak = 0;
  let current = sorted[0] === todayStr ? today : yesterday;

  for (const dateStr of sorted) {
    const d = new Date(dateStr + 'T00:00:00');
    const diff = Math.round((current - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) {
      streak += 1;
      // Move current back one day for next iteration
      current = new Date(d);
      current.setDate(current.getDate() - 1);
    } else {
      break; // gap found
    }
  }

  return streak;
}

// ── Helper: today's date string ──────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// ── GET all habits ───────────────────────────────────────────────────────────
// GET /api/habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET stats ────────────────────────────────────────────────────────────────
// GET /api/habits/stats
// IMPORTANT: must be declared before /:id so Express matches it correctly
router.get('/stats', async (req, res) => {
  try {
    const habits = await Habit.find();
    const today = todayStr();

    // Window helpers
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
    const totalCheckins = habits.reduce((sum, h) => sum + h.completedDates.length, 0);

    // Longest streak ever: for each habit compute max streak by scanning all dates
    let longestStreak = 0;
    let currentBestStreak = 0;

    for (const h of habits) {
      const cs = calculateStreak(h.completedDates);
      if (cs > currentBestStreak) currentBestStreak = cs;

      // Compute all-time longest by trying each date as the "end"
      const sorted = [...new Set(h.completedDates)].sort((a, b) => (a < b ? 1 : -1));
      let maxStreak = 0;
      let run = 0;
      for (let i = 0; i < sorted.length; i++) {
        if (i === 0) {
          run = 1;
        } else {
          const prev = new Date(sorted[i - 1] + 'T00:00:00');
          const curr = new Date(sorted[i] + 'T00:00:00');
          const diff = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
          if (diff === 1) {
            run += 1;
          } else {
            run = 1;
          }
        }
        if (run > maxStreak) maxStreak = run;
      }
      if (maxStreak > longestStreak) longestStreak = maxStreak;
    }

    // Weekly rate: % of habits that have at least one check-in this week
    const habitsThisWeek = habits.filter(h =>
      h.completedDates.some(d => d >= startOfWeekStr && d <= today)
    ).length;
    const weeklyRate = totalHabits > 0 ? Math.round((habitsThisWeek / totalHabits) * 100) : 0;

    // Monthly rate
    const habitsThisMonth = habits.filter(h =>
      h.completedDates.some(d => d >= startOfMonthStr && d <= today)
    ).length;
    const monthlyRate = totalHabits > 0 ? Math.round((habitsThisMonth / totalHabits) * 100) : 0;

    // Category breakdown
    const categories = ['Health', 'Study', 'Hobby', 'Work', 'Other'];
    const categoryBreakdown = {};
    for (const cat of categories) {
      categoryBreakdown[cat] = habits.filter(h => (h.category || 'Other') === cat).length;
    }

    res.json({
      totalHabits,
      completedToday,
      totalCheckins,
      longestStreak,
      currentBestStreak,
      weeklyRate,
      monthlyRate,
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET a single habit ───────────────────────────────────────────────────────
// GET /api/habits/:id
router.get('/:id', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── CREATE a new habit ───────────────────────────────────────────────────────
// POST /api/habits
router.post('/', async (req, res) => {
  try {
    const { name, description, frequency, color, icon, category } = req.body;
    const habit = new Habit({ name, description, frequency, color, icon, category });
    const savedHabit = await habit.save();
    res.status(201).json(savedHabit);
  } catch (err) {
    res.status(400).json({ message: 'Validation error', error: err.message });
  }
});

// ── CHECK-IN a habit for today (POST — primary) ──────────────────────────────
// POST /api/habits/:id/checkin
router.post('/:id/checkin', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const today = todayStr();

    if (habit.completedDates.includes(today)) {
      return res.status(400).json({ message: 'Already checked in today!' });
    }

    const { note } = req.body;
    habit.completedDates.push(today);
    habit.streak = calculateStreak(habit.completedDates);
    if (note !== undefined) habit.note = note;

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── CHECK-IN a habit for today (PUT — backwards compat) ─────────────────────
// PUT /api/habits/:id/checkin
router.put('/:id/checkin', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const today = todayStr();

    if (habit.completedDates.includes(today)) {
      return res.status(400).json({ message: 'Already checked in today!' });
    }

    const { note } = req.body;
    habit.completedDates.push(today);
    habit.streak = calculateStreak(habit.completedDates);
    if (note !== undefined) habit.note = note;

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── UNDO today's check-in ────────────────────────────────────────────────────
// DELETE /api/habits/:id/checkin
router.delete('/:id/checkin', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const today = todayStr();

    if (!habit.completedDates.includes(today)) {
      return res.status(400).json({ message: 'No check-in found for today' });
    }

    habit.completedDates = habit.completedDates.filter(d => d !== today);
    habit.streak = calculateStreak(habit.completedDates);
    habit.note = '';

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── UPDATE a habit ───────────────────────────────────────────────────────────
// PUT /api/habits/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description, frequency, color, icon, category } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (frequency !== undefined) updateFields.frequency = frequency;
    if (color !== undefined) updateFields.color = color;
    if (icon !== undefined) updateFields.icon = icon;
    if (category !== undefined) updateFields.category = category;

    const updatedHabit = await Habit.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    if (!updatedHabit) return res.status(404).json({ message: 'Habit not found' });
    res.json(updatedHabit);
  } catch (err) {
    res.status(400).json({ message: 'Validation error', error: err.message });
  }
});

// ── DELETE a habit ───────────────────────────────────────────────────────────
// DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedHabit = await Habit.findByIdAndDelete(req.params.id);
    if (!deletedHabit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

import { useState, useEffect, useCallback } from 'react';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  checkInHabit,
  undoCheckIn as apiUndoCheckIn,
} from '../services/api';

export function useHabits(showToast) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const notify = useCallback(
    (msg, type = 'success') => {
      if (showToast) showToast(msg, type);
    },
    [showToast]
  );

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getHabits();
      setHabits(res.data);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to connect to backend server';
      setError(errMsg);
      notify(`❌ ${errMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Add Habit
  const addHabit = async (habitData) => {
    try {
      const res = await createHabit(habitData);
      setHabits((prev) => [res.data, ...prev]);
      notify('🎯 New habit created successfully!', 'success');
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Could not create habit';
      notify(`❌ ${errMsg}`, 'error');
      return false;
    }
  };

  // Edit Habit
  const editHabit = async (id, updatedFields) => {
    const previousHabits = [...habits];
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) => (h._id === id ? { ...h, ...updatedFields } : h))
    );

    try {
      const res = await updateHabit(id, updatedFields);
      setHabits((prev) =>
        prev.map((h) => (h._id === id ? res.data : h))
      );
      notify('✏️ Habit updated!', 'success');
      return true;
    } catch (err) {
      // Rollback
      setHabits(previousHabits);
      const errMsg = err.response?.data?.message || 'Update failed';
      notify(`❌ ${errMsg}`, 'error');
      return false;
    }
  };

  // Remove Habit
  const removeHabit = async (id) => {
    const previousHabits = [...habits];
    // Optimistic removal
    setHabits((prev) => prev.filter((h) => h._id !== id));

    try {
      await deleteHabit(id);
      notify('🗑️ Habit deleted', 'info');
      return true;
    } catch (err) {
      // Rollback
      setHabits(previousHabits);
      const errMsg = err.response?.data?.message || 'Deletion failed';
      notify(`❌ ${errMsg}`, 'error');
      return false;
    }
  };

  // Check In
  const checkIn = async (id, note = '') => {
    const today = new Date().toISOString().split('T')[0];
    const previousHabits = [...habits];

    // Optimistic update
    setHabits((prev) =>
      prev.map((h) => {
        if (h._id === id) {
          const completedDates = h.completedDates.includes(today)
            ? h.completedDates
            : [...h.completedDates, today];
          return {
            ...h,
            completedDates,
            streak: (h.streak || 0) + 1,
            note: note || h.note,
          };
        }
        return h;
      })
    );

    try {
      const res = await checkInHabit(id, note);
      setHabits((prev) =>
        prev.map((h) => (h._id === id ? res.data : h))
      );
      notify('🔥 Checked in! Keep that momentum going!', 'success');
      return res.data;
    } catch (err) {
      // Rollback
      setHabits(previousHabits);
      const errMsg = err.response?.data?.message || 'Check-in failed';
      notify(`⚠️ ${errMsg}`, 'error');
      return null;
    }
  };

  // Undo Check In
  const undoCheckIn = async (id) => {
    const today = new Date().toISOString().split('T')[0];
    const previousHabits = [...habits];

    // Optimistic update
    setHabits((prev) =>
      prev.map((h) => {
        if (h._id === id) {
          return {
            ...h,
            completedDates: h.completedDates.filter((d) => d !== today),
            streak: Math.max(0, (h.streak || 1) - 1),
            note: '',
          };
        }
        return h;
      })
    );

    try {
      const res = await apiUndoCheckIn(id);
      setHabits((prev) =>
        prev.map((h) => (h._id === id ? res.data : h))
      );
      notify('↩️ Check-in undone for today', 'info');
      return res.data;
    } catch (err) {
      // Rollback
      setHabits(previousHabits);
      const errMsg = err.response?.data?.message || 'Undo check-in failed';
      notify(`⚠️ ${errMsg}`, 'error');
      return null;
    }
  };

  return {
    habits,
    loading,
    error,
    addHabit,
    editHabit,
    removeHabit,
    checkIn,
    undoCheckIn,
    refetch: fetchHabits,
  };
}

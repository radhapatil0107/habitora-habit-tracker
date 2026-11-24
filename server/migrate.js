/**
 * migrate.js — Safe Database Migration Script
 * Upgrades existing Habit documents with default values for new fields:
 * - icon: '🎯'
 * - category: 'Other'
 * - note: ''
 * - Recalculates streak from existing completedDates
 * 
 * Run with: node migrate.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Habit = require('./models/Habit');

async function migrate() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB for migration...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully.');

    const habits = await Habit.find();
    console.log(`📋 Found ${habits.length} existing habit record(s).`);

    let updatedCount = 0;

    for (const habit of habits) {
      let needsSave = false;

      if (!habit.icon) {
        habit.icon = '🎯';
        needsSave = true;
      }

      if (!habit.category) {
        habit.category = 'Other';
        needsSave = true;
      }

      if (habit.note === undefined) {
        habit.note = '';
        needsSave = true;
      }

      if (!habit.completedDates) {
        habit.completedDates = [];
        needsSave = true;
      }

      if (needsSave) {
        await habit.save();
        updatedCount++;
      }
    }

    console.log(`✨ Migration complete! Updated ${updatedCount} habit(s) to latest schema.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { createReminder, getUserReminders, completeReminder, deleteReminder } = require('../database/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try { res.json({ reminders: await getUserReminders(req.user.id) }); }
  catch { res.status(500).json({ error: 'Failed to get reminders.' }); }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, reminderDate, reminderType } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const r = await createReminder({ id: uuidv4(), user_id: req.user.id, title, description, reminderDate, reminderType });
    res.status(201).json({ reminder: r });
  } catch { res.status(500).json({ error: 'Failed to create reminder.' }); }
});

router.put('/:id/complete', authenticate, async (req, res) => {
  try { await completeReminder(req.params.id, req.user.id); res.json({ message: 'Done!' }); }
  catch { res.status(500).json({ error: 'Failed to update.' }); }
});

router.delete('/:id', authenticate, async (req, res) => {
  try { await deleteReminder(req.params.id, req.user.id); res.json({ message: 'Deleted.' }); }
  catch { res.status(500).json({ error: 'Failed to delete.' }); }
});

module.exports = router;

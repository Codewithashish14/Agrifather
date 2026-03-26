const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { findUserByEmail, findUserById, createUser, updateUser } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, language, state, district } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already registered.' });
    const password_hash = await bcrypt.hash(password, 12);
    const user = await createUser({ id: uuidv4(), name, email, phone, password_hash, language, state, district });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const safeUser = { ...user }; delete safeUser.password_hash;
    res.status(201).json({ message: 'Registration successful!', token, user: safeUser });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error during registration.' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const safeUser = { ...user }; delete safeUser.password_hash;
    res.json({ message: 'Login successful!', token, user: safeUser });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error during login.' }); }
});

router.get('/me', authenticate, (req, res) => {
  const safeUser = { ...req.user }; delete safeUser.password_hash;
  res.json({ user: safeUser });
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, language, state, district, farm_size, primary_crops, voice_enabled, response_style } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (language !== undefined) updates.language = language;
    if (state !== undefined) updates.state = state;
    if (district !== undefined) updates.district = district;
    if (farm_size !== undefined) updates.farm_size = farm_size;
    if (primary_crops !== undefined) updates.primary_crops = primary_crops;
    if (voice_enabled !== undefined) updates.voice_enabled = voice_enabled ? 1 : 0;
    if (response_style !== undefined) updates.response_style = response_style;
    const updated = await updateUser(req.user.id, updates);
    const safeUser = { ...updated }; delete safeUser.password_hash;
    res.json({ message: 'Profile updated!', user: safeUser });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error updating profile.' }); }
});

router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required.' });
    const valid = await bcrypt.compare(currentPassword, req.user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });
    const password_hash = await bcrypt.hash(newPassword, 12);
    await updateUser(req.user.id, { password_hash });
    res.json({ message: 'Password changed successfully!' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;

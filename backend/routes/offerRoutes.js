const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../authMiddleware');
const mailService = require('../services/mailService');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


const transStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/transformations/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `trans_${req.user.id}_${Date.now()}${ext}`);
  }
});
const transUpload = multer({ storage: transStorage, fileFilter: (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type.'));
}});

// Dodaj zdjęcia przemian
router.post('/trainer/transformations', authMiddleware.verifyToken, authMiddleware.isTrainer, transUpload.array('photos', 10), async (req, res) => {
  try {
    const userId = req.user.id;
    const photos = req.files.map(f => `/uploads/transformations/${f.filename}`);
    // Pobierz obecne zdjęcia
    const result = await pool.query('SELECT transformations FROM trainer_profiles WHERE user_id = $1', [userId]);
    let current = result.rows[0]?.transformations || [];
    // Dodaj nowe
    const updated = [...current, ...photos];
    await pool.query('UPDATE trainer_profiles SET transformations = $1 WHERE user_id = $2', [updated, userId]);
    res.json({ success: true, photos });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload transformation photos' });
  }
});

// Usuń zdjęcie przemiany
router.delete('/trainer/transformations', authMiddleware.verifyToken, authMiddleware.isTrainer, async (req, res) => {
  try {
    const userId = req.user.id;
    const { photo } = req.body;
    // Pobierz obecne zdjęcia
    const result = await pool.query('SELECT transformations FROM trainer_profiles WHERE user_id = $1', [userId]);
    let current = result.rows[0]?.transformations || [];
    const updated = current.filter(p => p !== photo);
    await pool.query('UPDATE trainer_profiles SET transformations = $1 WHERE user_id = $2', [updated, userId]);
    // Usuń plik fizycznie
    const filePath = path.join(__dirname, '..', photo);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete transformation photo' });
  }
});



// Pobierz listę trenerów z profilami
router.get('/trainers', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.profile_photo, tp.short_description
       FROM users u
       LEFT JOIN trainer_profiles tp ON tp.user_id = u.id
       WHERE u.role = 'trainer'`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Pobierz pełny profil trenera
router.get('/trainers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.profile_photo, tp.*
       FROM users u
       LEFT JOIN trainer_profiles tp ON tp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'trainer'`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Trainer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Przypisz trenera do użytkownika
router.post('/assign-trainer', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { trainer_id } = req.body;
    await pool.query(
      `INSERT INTO user_trainers (user_id, trainer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, trainer_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Edycja profilu trenera (tylko trener)
router.put('/trainer/profile', authMiddleware.verifyToken, authMiddleware.isTrainer, async (req, res) => {
  try {
    const userId = req.user.id;
    const { short_description, full_description, training_types, career, about, pricing, transformations } = req.body;
    await pool.query(
      `UPDATE trainer_profiles SET short_description = $1, full_description = $2, training_types = $3, career = $4, about = $5, pricing = $6, transformations = $7 WHERE user_id = $8`,
      [short_description, full_description, training_types, career, about, pricing, transformations, userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/trainers/me', authMiddleware.verifyToken, authMiddleware.isTrainer, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.profile_photo, tp.*
       FROM users u
       LEFT JOIN trainer_profiles tp ON tp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'trainer'`,
      [userId]
    );
    if (result.rows.length === 0) {
      console.error(`Trainer profile not found for user id ${userId}`);
      return res.status(404).json({ message: 'Trainer profile not found' });
    }
    // Additional validation of trainer_profiles fields
    const profile = result.rows[0];
    if (!profile.short_description) profile.short_description = "";
    if (!profile.full_description) profile.full_description = "";
    if (!profile.training_types) profile.training_types = [];
    if (!profile.career) profile.career = "";
    if (!profile.about) profile.about = "";
    if (!profile.pricing) profile.pricing = "";
    if (!profile.transformations) profile.transformations = [];
    res.json(profile);
  } catch (err) {
    console.error('Error fetching trainer profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Wyślij maila do trenera
router.post('/trainer/contact', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { trainer_email, subject, message } = req.body;
    await mailService.sendTokenEmail(trainer_email, '', 'custom', subject, message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send email' });
  }
});



module.exports = router;
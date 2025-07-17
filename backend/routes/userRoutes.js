// backend/userRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require("axios");
const bcrypt = require('bcrypt');
const authMiddleware = require('../authMiddleware');
const authController = require('../controllers/authController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, JPG, JPEG, WEBP are allowed.'));
  }
}


const upload = multer({ storage, fileFilter });

router.post('/profile/photo', authMiddleware.verifyToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded or invalid file type" });
    }
    const photoPath = `/uploads/${req.file.filename}`;
    await pool.query(
      `UPDATE users SET profile_photo = $1 WHERE id = $2`,
      [photoPath, req.user.id]
    );
    res.json({ success: true, photo: photoPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload photo' });
  }
});



// Get all users (admin only)
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, first_name, last_name, role FROM users'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update profile (dla zalogowanego użytkownika)
router.delete('/profile/photo', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT profile_photo FROM users WHERE id = $1', [userId]);
    const photoPath = result.rows[0]?.profile_photo;
    if (photoPath) {
      const filePath = path.join(__dirname, '..', photoPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await pool.query('UPDATE users SET profile_photo = NULL WHERE id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete photo' });
  }
});

// ...w endpointzie rejestracji i edycji profilu obsłuż pole sex...
router.put('/profile/update', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, email, phone, sex } = req.body;
  try {
    await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3, phone = $4, sex = $5 WHERE id = $6`,
      [first_name, last_name, email, phone, sex, userId]
    );
    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.get('/me', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      'SELECT id, username, first_name, last_name, email, phone, two_factor_method, profile_photo, sex,role FROM users WHERE id = $1',
      [userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user info' });
  }
});








// Create new user (admin only)
router.post('/create', authMiddleware.verifyToken, authMiddleware.isAdmin, async (req, res) => {
    try {
        const { username, password, email, telephone_number, role } = req.body;

        // Check if username already exists
        const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, password, email, phone, role, two_factor_method) 
             VALUES ($1, $2, $3, $4, $5, '' ) 
             RETURNING id, username, email, phone, role, two_factor_method`,
            [username, hashedPassword, email, telephone_number, role]
        );

         const userId = result.rows[0].id;

        // Jeśli rola to trainer, utwórz pusty profil trenerski
        if (role === "trainer") {
            await pool.query(
                `INSERT INTO trainer_profiles (user_id, short_description, full_description, training_types, career, about, pricing, transformations)
                 VALUES ($1, '', '', ARRAY[]::text[], '', '', '', ARRAY[]::text[])`,
                [userId]
            );
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Password reset routes

router.post('/password-reset/request', authController.requestPasswordReset);
router.post('/password-reset/verify', authController.verifyResetToken);
router.post('/password-reset/change', authController.changePasswordWithOldPassword);
router.post('/password-reset/change-with-token', authController.changePassword);

//zostan trenerem 
router.post('/become-trainer', authMiddleware.verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
        // Zmień rolę
        if(role !=="admin"){
           await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['trainer', userId]);
        const exists = await pool.query('SELECT 1 FROM trainer_profiles WHERE user_id = $1', [userId]);
        if (exists.rows.length === 0) {
            await pool.query(
                `INSERT INTO trainer_profiles (user_id, short_description, full_description, training_types, career, about, pricing, transformations)
                 VALUES ($1, '', '', ARRAY[]::text[], '', '', '', ARRAY[]::text[])`,
                [userId]
            );
        }
        res.json({ success: true });
        }else{
                  res.status(500).json({ message: 'Admin nie moze zostac trenerem' });

        }
       
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});



// Delete user (admin only)
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own admin account' });
        }

        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update 2FA method for current user
router.put('/2fa', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { method } = req.body; // "sms", "email", or ""
  try {
    await pool.query('UPDATE users SET two_factor_method = $1 WHERE id = $2', [method, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update 2FA method' });
  }
});

// Get current user info (for settings)
router.get('/me', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query('SELECT id, username, two_factor_method, role FROM users WHERE id = $1', [userId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user info' });
  }
});



//update w admin panelu
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone, role } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3, phone = $4, role = $5 WHERE id = $6 RETURNING *`,
      [first_name, last_name, email, phone, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});




router.post('/fix-trainer-profile/:userId', authMiddleware.verifyToken, authMiddleware.isAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const exists = await pool.query('SELECT 1 FROM trainer_profiles WHERE user_id = $1', [userId]);
    if (exists.rows.length === 0) {
      await pool.query(
        `INSERT INTO trainer_profiles (user_id, short_description, full_description, training_types, career, about, pricing, transformations)
         VALUES ($1, '', '', ARRAY[]::text[], '', '', '', ARRAY[]::text[])`,
        [userId]
      );
      res.json({ success: true, message: `Empty trainer_profile created for user ${userId}` });
    } else {
      res.json({ success: false, message: `trainer_profile already exists for user ${userId}` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

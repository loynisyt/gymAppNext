const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register); // <-- DODAJ TO!
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/verify-reset-token', authController.verifyResetToken);
router.post('/change-password', authController.changePassword);
router.post('/change-password-old', authController.changePasswordWithOldPassword);

module.exports = router;
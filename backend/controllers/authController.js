// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const tokenService = require('../services/tokenService');


exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, password, email, is_active) VALUES ($1, $2, $3, $4) RETURNING id, username, email`,
      [username, hashedPassword, email, false]
    );
    const userId = result.rows[0].id;


    

    // Wygeneruj token aktywacyjny
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Zapisz token do tabeli
    await pool.query(
      `INSERT INTO user_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );

    // Wyślij token na maila
    await require('../services/mailService').sendTokenEmail(email, token, 'activation');

    // Zamaskuj e-mail do wyświetlenia w frontendzie
    const maskedEmail = maskEmail(email);

    res.status(201).json({
      message: 'User registered. Check your email for activation.',
      maskedEmail
    });
  } catch (error) {
    console.error(error); // <-- dodaj to, by widzieć błąd w konsoli!
    res.status(500).json({ message: 'Server error during registration' });
  }
};

function maskEmail(email) {
  const [user, domain] = email.split('@');
  if (user.length <= 2) return email;
  return user.slice(0, 2) + '****' + user.slice(-2) + '@' + domain;
}



exports.login = async (req, res) => {
    try {
        const { username, password, twoFactorToken } = req.body;

        // Find user
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check 2FA method
        if (user.two_factor_method && user.two_factor_method !== '') {
            // If 2FA token not provided, generate and send token
            if (!twoFactorToken) {
                const token = Math.floor(100000 + Math.random() * 900000).toString();
                const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

                // Save token in password_reset_tokens table with user_id and expires_at
                await pool.query(
                    `INSERT INTO user_tokens (user_id, token, expires_at)
                     VALUES ($1, $2, $3)`,
                    [user.id, token, expiresAt]
                );

                // Send token via sms or email
                if (user.two_factor_method === 'email') {
                    await mailService.sendTokenEmail(user.email, token, '2FA');
                } else if (user.two_factor_method === 'sms') {
                    // TODO: Implement SMS sending service here
                    console.log(`Sending 2FA token ${token} to phone ${user.phone}`);
                }

                return res.status(200).json({ message: '2FA token sent', twoFactorRequired: true });
            } else {
                // Verify provided 2FA token
                const tokenResult = await pool.query(
                    `SELECT * FROM user_tokens
                     WHERE user_id = $1 AND token = $2 AND expires_at > NOW()`,
                    [user.id, twoFactorToken]
                );

                if (tokenResult.rows.length === 0) {
                    return res.status(401).json({ message: 'Invalid or expired 2FA token' });
                }

                // Delete used token
                await pool.query(
                    `DELETE FROM user_tokens WHERE user_id = $1 AND token = $2`,
                    [user.id, twoFactorToken]
                );
            }
        }
        

        // Create JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );


        // Store token in DB
        await tokenService.storeToken(user.id, token);

        // Delete expired tokens
        await tokenService.removeExpiredTokens(user.id);

        // Send response
        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.is_active,
            },
            token,
            role: user.role, // Include role in response
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};


// Generate 6-digit numeric token
function generateResetToken() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}



// Mask phone number for display, e.g. 78*****63
function maskPhone(phone) {
    if (phone.length <= 4) return phone;
    return phone.slice(0, 2) + '*****' + phone.slice(-2);
}

// Request password reset token
exports.requestPasswordReset = async (req, res) => {
    try {
        const { username, method } = req.body; // method: 'email' or 'sms'

        const userResult = await pool.query('SELECT id, email, phone FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = userResult.rows[0];

        const token = generateResetToken();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 5 minutes from now

        // Save token in a new table password_reset_tokens (create this table)
        await pool.query(
            `INSERT INTO user_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)`,
            [user.id, token, expiresAt]
        );

        // Send token via chosen method
        if (method === 'email') {
            await mailService.sendTokenEmail(user.email, token, 'password reset');
        } else if (method === 'sms') {



            // Send SMS with token (implement SMS sending)
            console.log(`Sending password reset token ${token} to phone ${user.phone}`);
        } 
        
        else {
            return res.status(400).json({ message: 'Invalid method' });
        }

        // Return masked contact info to help user
        res.json({
            message: `Password reset token sent via ${method}`,
            contact: method === 'email' ? maskEmail(user.email) : maskPhone(user.phone)
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Server error during password reset request' });
    }
};

// Verify password reset token
exports.verifyResetToken = async (req, res) => {
    try {
        const { username, token } = req.body;

        const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userId = userResult.rows[0].id;

        const tokenResult = await pool.query(
            `SELECT * FROM user_tokens
             WHERE user_id = $1 AND token = $2 AND expires_at > NOW()`,
            [userId, token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        res.json({ message: 'Token verified' });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ message: 'Server error during token verification' });
    }
};

// Change password after token verification
exports.changePassword = async (req, res) => {
    try {
        const { username, token, newPassword } = req.body;

        const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = userResult.rows[0];

        // Verify token
        const tokenResult = await pool.query(
            `SELECT * FROM password_reset_tokens 
             WHERE user_id = $1 AND token = $2 AND expires_at > NOW()`,
            [user.id, token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Delete used token
        await pool.query(
            `DELETE FROM password_reset_tokens WHERE user_id = $1 AND token = $2`,
            [user.id, token]
        );

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE users SET password = $1 WHERE id = $2`,
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error during password change' });
    }
};

exports.changePasswordWithOldPassword = async (req, res) => {
    try {
        const { username, oldPassword, newPassword } = req.body;

        if (!username || !oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Username, old password and new password are required' });
        }

        const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = userResult.rows[0];

        // Verify old password
        const isValidPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE users SET password = $1 WHERE id = $2`,
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password with old password error:', error);
        res.status(500).json({ message: 'Server error during password change' });
    }
};




exports.createUser = async (req, res) => {
    try {
        const { username, password, firstName, lastName, role = 'user' } = req.body;

        // Check if user exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (username, password, email, telephone-number, role) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, username, first_name, last_name, role`,
            [username, hashedPassword, firstName, lastName, role]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

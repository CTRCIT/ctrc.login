const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

/**
 * Signup via email using nodemailer.
 * 
 * Usage:
 *   POST /signup-email { email: string }
 *   - Sends a signup code to the email.
 *   POST /verify-signup { email: string, code: string }
 *   - Verifies the code for signup.
 */


const EMAIL_NAME = process.env.EMAIL_NAME;
const GMAIL_APP_PWD = process.env.GMAIL_APP_PWD;

if (!EMAIL_NAME || !GMAIL_APP_PWD) {
    throw new Error('EMAIL_NAME and GMAIL_APP_PWD env vars required');
}

const router = express.Router();

// In-memory store for signup codes (for demo; use DB in production)
const signupCodes = new Map();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_NAME,
        pass: GMAIL_APP_PWD,
    },
});

// Helper: generate 6-digit code
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /signup-email { email }
router.post('/signup-email', async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Invalid email' });
    }

    const code = generateCode();
    signupCodes.set(email, { code, expires: Date.now() + 10 * 60 * 1000 }); // 10 min

    try {
        await transporter.sendMail({
            from: `"CTRC" <${EMAIL_NAME}>`,
            to: email,
            subject: '您的註冊驗證碼',
            text: `您的註冊驗證碼是: ${code} (10分鐘內有效)`,
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Email send failed' });
    }
});

// POST /verify-signup { email, code }
router.post('/verify-signup', (req, res) => {
    const { email, code } = req.body;
    const entry = signupCodes.get(email);
    if (
        !entry ||
        entry.code !== code ||
        Date.now() > entry.expires
    ) {
        return res.status(400).json({ error: '驗證碼無效或已過期' });
    }
    signupCodes.delete(email);
    // Here you would create the user account in your DB
    res.json({ success: true, email });
});

module.exports = router;
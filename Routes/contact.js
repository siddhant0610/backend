const express = require('express');
const router = express.Router();
const Contact = require('../Models/ContactMessage');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

// Rate limiter to prevent abuse
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many contact form submissions. Please try again later.',
});

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter on server start
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Nodemailer transporter error:', error);
  } else {
    console.log('✅ Nodemailer transporter is ready');
  }
});

// POST: Create a contact message and send email
router.post(
  '/',
  contactLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
      // Save to MongoDB
      const newContact = new Contact({ name, email, message });
      const savedContact = await newContact.save();

      // Send email to admin
      await transporter.sendMail({
        from: `"${name}" <${process.env.ADMIN_EMAIL}>`, // sender address
        to: 'neelukhajuria11@gmail.com', // admin receives the mail
        replyTo: email,
        subject: `New Contact Form Submission from ${name}`,
        text: `
You have received a new message from the contact form:

Name: ${name}
Email: ${email}

Message:
${message}
        `,
      });

      return res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: savedContact,
      });
    } catch (err) {
      console.error('❌ Error in POST /contact:', err.message);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request. Please try again.',
      });
    }
  }
);

// GET: Retrieve all contacts with optional filters
router.get('/', async (req, res) => {
  const { isRead, email } = req.query;
  const filter = {};
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  if (email) filter.email = { $regex: email, $options: 'i' };

  try {
    const contacts = await Contact.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    console.error('❌ Error in GET /contact:', err.message);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;

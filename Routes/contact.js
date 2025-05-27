const express = require('express');
const router = express.Router();
const Contact = require('../Models/ContactMessage');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { Parser } = require('json2csv');

// Rate limiter
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many contact form submissions. Please try again later.'
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

// POST: Create a contact
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
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, message } = req.body;
      const newContact = new Contact({ name, email, message });
      const savedContact = await newContact.save();

      await transporter.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: process.env.ADMIN_EMAIL,
        replyTo: email,
        subject: `New Contact Form Submission from ${name}`,
        text: `Email: ${email}\n\nMessage:\n${message}`
      });

      res.status(200).json({ success: true, data: savedContact });
    } catch (err) {
      console.error('Error in POST /contact:', err);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
);
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Simulate saving to DB or sending email
    console.log("Received contact form data:", { name, email, message });

    res.status(200).json({ success: true, message: "Message received!" });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET: Retrieve contacts with optional filters
router.get('/', async (req, res) => {
  const { isRead, email } = req.query;
  const filter = {};
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  if (email) filter.email = { $regex: email, $options: 'i' };

  try {
    const contacts = await Contact.find(filter).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    console.error('Error in GET /contact:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// PATCH: Mark as read
router.patch('/:id/mark-read', async (req, res) => {
  try {
    const updated = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE: Delete a contact
router.delete('/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET: Export contacts as CSV
router.get('/export', async (req, res) => {
  try {
    const contacts = await Contact.find().lean();
    const fields = ['name', 'email', 'message', 'isRead', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(contacts);

    res.header('Content-Type', 'text/csv');
    res.attachment('contacts.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/contact', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


module.exports = router;

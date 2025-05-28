const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const contactRoutes = require('./Routes/contact'); // Import contact routes

const allowedOrigins = [
  'http://localhost:5173',
  'https://www.tatvaalignment.com'
];

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send("Hello from contact route backend!");
});

// Function to drop the unique email index if it exists
async function dropEmailUniqueIndex() {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('contacts');

    // Get current indexes
    const indexes = await collection.indexes();

    // Find if 'email_1' index exists and is unique
    const emailIndex = indexes.find(index => index.name === 'email_1');

    if (emailIndex && emailIndex.unique) {
      await collection.dropIndex('email_1');
      console.log('✅ Dropped unique index on email');
    } else {
      console.log('ℹ️ No unique index on email found or already dropped');
    }
  } catch (err) {
    console.error('❌ Error dropping email unique index:', err.message);
  }
}

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI, {})
  .then(async () => {
    console.log('MongoDB connected');

    // Drop unique email index if it exists
    await dropEmailUniqueIndex();

    // Mount contact routes at /api/contact
    app.use('/api/contact', contactRoutes);

    // Start server after DB connection and index check/drop
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));

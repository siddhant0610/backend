// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const contactRoutes = require('./Routes/contact');  // Import routes
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.tatvaalignment.com'
];
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // if you're using cookies or auth
}));
app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
  res.send("Hello from contact route");
});
mongoose.connect(process.env.MONGODB_URI, {
 
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use the contact routes with a prefix, e.g., /api/contact
app.use('/api/contact', contactRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

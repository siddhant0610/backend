// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const contactRoutes = require('./Routes/contact');  // Import routes

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'www.tatvaalignment.com'] }));
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

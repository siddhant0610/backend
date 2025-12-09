// Server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const courseRoutes = require("./Routes/Course.route.js");
const contactRoutes = require("./Routes/contact.js");
const Courses = require("./Models/courseSchema.js"); // only used in the direct GET route

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://www.tatvaalignment.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Simple test route – use this to confirm backend is running
app.get("/", (req, res) => {
  res.json({ message: "Backend is running ✅" });
});

// ✅ Direct courses route (works even without router)
app.get("/api/Courses", async (req, res) => {
  try {
    const courses = await Courses.find();
    res.json(courses);
  } catch (err) {
    console.error("❌ Error fetching courses:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Router-based courses API (recommended)
// So final URL: /api/courses/...
app.use("/api/courses", courseRoutes);

// 🔧 Optional: drop unique index on "email" in contacts collection
async function dropEmailUniqueIndex() {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection("contacts");

    const indexes = await collection.indexes();
    const emailIndex = indexes.find((index) => index.name === "email_1");

    if (emailIndex && emailIndex.unique) {
      await collection.dropIndex("email_1");
      console.log("✅ Dropped unique index on email");
    } else {
      console.log("ℹ️ No unique index on email found or already dropped");
    }
  } catch (err) {
    console.error("❌ Error dropping email unique index:", err.message);
  }
}

// ✅ Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(async () => {
    console.log("MongoDB connected");

    // Only if you still need this for contacts
    await dropEmailUniqueIndex();

    // Contact routes mounted after DB connect
    app.use("/api/contact", contactRoutes);

    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err.message));

// routes/courseRoutes.js
const express = require("express");
const Course = require("../Models/courseSchema.js");        // ✅ correct path
const { protect, admin } = require("../auth.middleware.js"); // ✅ go up one level

const router = express.Router();

/* Create Course (Admin Only) */
router.post("/", async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    console.error("Create course error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* Get All Courses (public) */
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find(); // you were filtering isPublished but your schema doesn't have it
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* Get One Course by slug/slung */
router.get("/:slung", async (req, res) => {
  try {
    const course = await Course.findOne({ slung: req.params.slung });

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* Update Course */
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* Delete Course */
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;   // <-- Use module.exports not export default

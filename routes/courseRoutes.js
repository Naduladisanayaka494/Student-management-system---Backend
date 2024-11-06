const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new course
router.post('/',async (req, res) => {
  const { title, description, teacherId } = req.body;

  const course = new Course({ title, description, teacher: teacherId });
  await course.save();
  res.status(201).send('Course created successfully');
});

// Get all courses
router.get('/', async (req, res) => {
  const courses = await Course.find().populate('teacher', 'name');
  res.json(courses);
});

// Enroll a student in a course
router.post('/:courseId/enroll', async (req, res) => {
  const courseId = req.params.courseId;
  const studentId = req.user.id;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).send('Course not found');

  course.enrolledStudents.push(studentId);
  await course.save();
  res.send('Student enrolled in course successfully');
});

module.exports = router;

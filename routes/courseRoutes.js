const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new course
router.post('/', async (req, res) => {
  const { title, description, teacher } = req.body;

  const course = new Course({ title, description, teacher });
  await course.save();
  res.status(201).send('Course created successfully');
});

// Get all courses
router.get('/', async (req, res) => {
  const courses = await Course.find().populate('teacher', 'name');
  res.json(courses);
});

// Enroll a student in a course
router.post('/:courseId/enroll/:studentId', async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.params.studentId;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).send('Course not found');

    if (!course.enrolledStudents.includes(studentId)) {
      course.enrolledStudents.push(studentId);
      await course.save();
      res.send('Student enrolled in course successfully');
    } else {
      res.status(400).send('Student is already enrolled in this course');
    }
  } catch (error) {
    console.error('Error enrolling student in course:', error);
    res.status(500).send('Server error');
  }
});

// Edit a course by ID
router.put('/:courseId', async (req, res) => {
  const { title, description, teacher } = req.body;
  const courseId = req.params.courseId;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).send('Course not found');

    // Update the course fields if they are provided
    if (title) course.title = title;
    if (description) course.description = description;
    if (teacher) course.teacher = teacher;

    await course.save();
    res.send('Course updated successfully');
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).send('Server error');
  }
});

// Delete a course by ID
router.delete('/:courseId', async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) return res.status(404).send('Course not found');

    res.send('Course deleted successfully');
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).send('Server error');
  }
});

router.get('/:courseId', async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const course = await Course.findById(courseId).populate('teacher', 'name');
    if (!course) return res.status(404).send('Course not found');

    res.json(course);
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;

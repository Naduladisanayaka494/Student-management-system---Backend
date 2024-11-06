const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Course = require('../models/Course')
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// router.post('/register', async (req, res) => {
//   const { name, email, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const student = new Student({ name, email, password: hashedPassword });
//   await student.save();
//   res.status(201).send('Student registered successfully');
// });


const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save files in the uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Define the filename format
  },
});
const upload = multer({ storage: storage });

router.post("/register", upload.single("profilePicture"), async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if a file was uploaded
  const profilePicture = req.file ? req.file.path : null;

  const student = new Student({
    name,
    email,
    password: hashedPassword,
    profilePicture,
  });
  await student.save();
  res.status(201).send("Student registered successfully");
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ email });

  if (!student) return res.status(400).send('Invalid email or password');

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.status(400).send('Invalid email or password');

  const token = jwt.sign(
    { id: student._id, role: student.role }, 
    process.env.jwtSecretKey, 
    { expiresIn: '1h' }
  );
  
  res.json({ token });
});

router.post("/unenroll", async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    // Check if student and course IDs are valid
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).send("Invalid student or course ID");
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).send("Course not found");
    }

    // Check if the student is enrolled in the course
    if (!course.enrolledStudents.includes(studentId)) {
      return res.status(400).send("Student is not enrolled in this course");
    }

    // Remove the student from the enrolledStudents array
    course.enrolledStudents = course.enrolledStudents.filter(
      (id) => id.toString() !== studentId
    );
    await course.save();

    res.status(200).send("Successfully unenrolled from the course");
  } catch (error) {
    console.error("Error unenrolling from course:", error);
    res.status(500).send("Server error");
  }
});



router.get('/students/:studentId/enrollments', async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const courses = await Course.find({ enrolledStudents: studentId }); // Use "enrolledStudents" field

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses for student:', error);
    res.status(500).send('Server error');
  }
});



router.get('/my-courses/:teacherId', async (req, res) => {
  try {
    const teacherId = req.params.teacherId; 

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).send('Invalid teacher ID');
    }

    const courses = await Course.find({ teacher: teacherId });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses for teacher:', error);
    res.status(500).send('Server error');
  }
});

router.get('/search-enrollments',async (req, res) => {
  try {
    const studentId = req.user.id; // Get student's ID from token
    const { title } = req.query; // Get the title from query parameters

    // Find courses where this student is enrolled with title containing the search keyword (case-insensitive)
    const courses = await Course.find({
      students: studentId,
      title: { $regex: title, $options: 'i' }, // Case-insensitive search
    });

    res.json(courses);
  } catch (error) {
    console.error('Error searching courses for student:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;

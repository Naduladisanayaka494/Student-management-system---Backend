const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Course = require('../models/Course')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set the folder where files will be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Define the filename format
  },
});


const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ storage: storage });

router.post("/register", upload.single("profilePicture"), async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if a file was uploaded
  const profilePicture = req.file ? req.file.path : null;

  const teacher = new Teacher({
    name,
    email,
    password: hashedPassword,
    profilePicture,
  });
  await teacher.save();
  res.status(201).send("Teacher registered successfully");
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const teacher = await Teacher.findOne({ email });

  if (!teacher) return res.status(400).send('Invalid email or password');

  const isMatch = await bcrypt.compare(password, teacher.password);
  if (!isMatch) return res.status(400).send('Invalid email or password');


  const token = jwt.sign(
    { id: teacher._id, role: teacher.role }, 
    process.env.jwtSecretKey, 
    { expiresIn: '1h' }
  );

  res.json({ token });
});


router.get('/search', async (req, res) => {
  try {
    const teacherId = req.user.id; // Get teacher's ID from token
    const { title } = req.query; // Get the title from query parameters


    const courses = await Course.find({
      teacher: teacherId,
      title: { $regex: title, $options: 'i' }, // Case-insensitive search
    });

    res.json(courses);
  } catch (error) {
    console.error('Error searching courses for teacher:', error);
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

router.post("/add-homework", async (req, res) => {
  try {
    const { title, description, dueDate, courseId, teacherId } = req.body;

    const homework = new Homework({
      title,
      description,
      dueDate,
      courseId,
      teacher: teacherId,
    });

    await homework.save();
    res.status(201).json({ message: "Homework added successfully" });
  } catch (error) {
    console.error("Error adding homework:", error);
    res.status(500).send("Server error");
  }
});


module.exports = router;

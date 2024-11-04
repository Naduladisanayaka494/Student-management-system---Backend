const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Register a new student
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const profilePicture = req.file ? req.file.path : null;

  const student = new Student({ name, email, password: hashedPassword, profilePicture });
  await student.save();
  res.status(201).send('Student registered successfully');
});

// Login student
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ email });

  if (!student) return res.status(400).send('Invalid email or password');

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.status(400).send('Invalid email or password');

  const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Get student profile
router.get('/profile', async (req, res) => {
  const student = await Student.findById(req.user.id).select('-password');
  res.json(student);
});

module.exports = router;

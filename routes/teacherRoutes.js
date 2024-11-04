const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
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

// Register a new teacher
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const profilePicture = req.file ? req.file.path : null;

  const teacher = new Teacher({ name, email, password: hashedPassword, profilePicture });
  await teacher.save();
  res.status(201).send('Teacher registered successfully');
});

// Login teacher
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const teacher = await Teacher.findOne({ email });

  if (!teacher) return res.status(400).send('Invalid email or password');

  const isMatch = await bcrypt.compare(password, teacher.password);
  if (!isMatch) return res.status(400).send('Invalid email or password');

  const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Get teacher profile
router.get('/profile', async (req, res) => {
  const teacher = await Teacher.findById(req.user.id).select('-password');
  res.json(teacher);
});

module.exports = router;

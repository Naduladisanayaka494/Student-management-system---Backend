const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new teacher (no change here)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const teacher = new Teacher({ name, email, password: hashedPassword });
  await teacher.save();
  res.status(201).send('Teacher registered successfully');
});

// Login teacher with role in JWT
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const teacher = await Teacher.findOne({ email });

  if (!teacher) return res.status(400).send('Invalid email or password');

  const isMatch = await bcrypt.compare(password, teacher.password);
  if (!isMatch) return res.status(400).send('Invalid email or password');

  // Include role in the token payload
  const token = jwt.sign(
    { id: teacher._id, role: teacher.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );

  res.json({ token });
});

module.exports = router;

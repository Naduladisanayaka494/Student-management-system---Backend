const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const student = new Student({ name, email, password: hashedPassword });
  await student.save();
  res.status(201).send('Student registered successfully');
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

module.exports = router;

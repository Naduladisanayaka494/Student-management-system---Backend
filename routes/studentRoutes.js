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



router.get('/my-enrollments',  async (req, res) => {
  try {
    const studentId = req.user.id; 


    const courses = await Course.find({ students: studentId });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses for student:', error);
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

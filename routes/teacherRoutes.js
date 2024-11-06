const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Course = require('../models/Course')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const teacher = new Teacher({ name, email, password: hashedPassword });
  await teacher.save();
  res.status(201).send('Teacher registered successfully');
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




module.exports = router;

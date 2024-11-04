const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  role: { type: String, default: 'teacher' }  // Adding a default role for teachers
});

module.exports = mongoose.model('Teacher', TeacherSchema);

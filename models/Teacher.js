const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String }, // Path to the profile picture
  role: { type: String, default: "teacher" },
});

module.exports = mongoose.model('Teacher', TeacherSchema);

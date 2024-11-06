const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String }, // Path to the profile picture
  role: { type: String, default: "student" },
});

module.exports = mongoose.model('Student', StudentSchema);



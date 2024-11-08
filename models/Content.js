// models/Content.js
const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  filePath: { type: String }, // Path to the uploaded file
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Content", contentSchema);

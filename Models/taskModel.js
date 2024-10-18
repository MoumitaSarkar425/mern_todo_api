const mongoose = require("mongoose");
const { Schema } = mongoose;

const taskSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  desc: {
    type: String,
  },
  isImportant: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the current date and time
  },
  userId: {
    type: Schema.Types.ObjectId, // References the User model
    ref: 'User',  // Name of the User model
    required: true,  // Every task must be associated with a user
  },
  isDeleted:{
    type: Boolean,
    default: false
  }
});

// Task model created using task Schema
const Task = mongoose.model("task", taskSchema);
module.exports = Task;

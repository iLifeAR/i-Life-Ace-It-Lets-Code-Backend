import mongoose from "mongoose";

const librarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  // Assignments included in this library
  codingAssignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodingAssignment",
    },
  ],
  quizAssignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAssignment",
    },
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Library", librarySchema);

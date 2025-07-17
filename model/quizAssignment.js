import mongoose from "mongoose";

const quizAssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [{ type: String }],
      correctAnswer: { type: String, required: true },
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("QuizAssignment", quizAssignmentSchema);

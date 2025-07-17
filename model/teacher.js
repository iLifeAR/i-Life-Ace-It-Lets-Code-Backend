import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  subjects: [String],
  createdAssignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "CodingAssignment" }],
  createdQuizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuizAssignment" }],
  role: { type: String, default: "teacher" },
});

export default mongoose.model("Teacher", teacherSchema);

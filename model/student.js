import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  codingAssignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "CodingAssignment" }],
  quizAssignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuizAssignment" }],
  libraryAccess: Boolean,
  role: { type: String, default: "student" },
});

export default mongoose.model("Student", studentSchema);

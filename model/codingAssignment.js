import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String },
  output: { type: String },
  points: { type: Number },
});

const codingAssignmentSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },

  difficulty: { type: String },
  assignment_type: { type: String },

  languages_allowed: [{ type: String }],

  starter_code: {
    type: Map,
    of: String,
  },

  sample_tests: [testCaseSchema],
  hidden_tests: [testCaseSchema],

  time_limit: { type: Number, default: 1 },
  total_time_limit: { type: Number, default: 30 },
  total_points: { type: Number, default: 100 },
  memory_limit: { type: Number, default: 128 },

  tags: [String],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("CodingAssignment", codingAssignmentSchema);

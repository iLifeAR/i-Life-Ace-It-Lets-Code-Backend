import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String },
  output: { type: String },
  points: { type: Number },
});

const practiseAssignmentSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },

  difficulty: { type: String },
  assignment_type: { type: String },

  languages_allowed: [{ type: String }],
  all_languages: [{ type: String }], // ✅ New field added here

  starter_code: {
    type: Map,
    of: String,
  },

  sample_tests: [testCaseSchema],
  hidden_tests: [testCaseSchema],
  inputShape: { type: String, default: "array" }, // New field to define input structure
  time_limit: { type: Number, default: 1 },
  total_time_limit: { type: Number, default: 30 },
  total_points: { type: Number, default: 100 },
  memory_limit: { type: Number, default: 128 },
  learningObjectives: [{ type: String }],
  tags: [String],
  requirements: [{ type: String }], // Bullet point list of key requirements
  plagiarismCheck: { type: Boolean, default: false },
  allowMultipleAttempts: { type: Boolean, default: false },
  showHints: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false }, // ✅ newly added
  examples: [
  {
    input: { type: String },
    output: { type: String },
  },
],

  hints: [{ type: String }],        // Optional hints to help students


  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("PractiseAssignment", practiseAssignmentSchema);

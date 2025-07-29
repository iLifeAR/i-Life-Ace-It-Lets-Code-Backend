import mongoose from "mongoose";

// Updated test case schema to use 'expected' instead of 'output'
const testCaseSchema = new mongoose.Schema({
  input: { type: String },
  expected: { type: String }, // Changed from 'output' to 'expected'
  points: { type: Number },
});

const practiseAssignmentSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },

  difficulty: { type: String },
  assignment_type: { type: String },

  languages_allowed: [{ type: String }],
  all_languages: [{ type: String }], // ✅ Keep this field

  // Changed from starter_code to full_code
  full_code: {
    type: Map,
    of: String,
  },

  // Updated to language-specific test structure
  sample_tests: {
    type: Map,
    of: [testCaseSchema], // Each language maps to an array of test cases
  },
  hidden_tests: {
    type: Map,
    of: [testCaseSchema], // Each language maps to an array of test cases
  },

  inputShape: { type: String, default: "array" }, // Keep this field
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
  isCompleted: { type: Boolean, default: false }, // ✅ Keep this field
  examples: [
    {
      input: { type: String },
      output: { type: String }, // Keep as 'output' for examples (different from test cases)
    },
  ],

  hints: [{ type: String }], // Optional hints to help students

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

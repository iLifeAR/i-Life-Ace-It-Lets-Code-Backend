import mongoose from "mongoose";

const codingAssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,
  constraints: String,
  hint: String,

  starterCode: {
    python: String,
    javascript: String,
    cpp: String,
    java: String,
  },

  // Dynamic test cases with flexible inputs
  testCases: [
    {
      input: {
        type: String, // stringified input (can be array, matrix, etc.)
        required: true,
      },
      expectedOutput: {
        type: String,
        required: true,
      },
      hidden: {
        type: Boolean,
        default: false,
      },
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

export default mongoose.model("CodingAssignment", codingAssignmentSchema);

import mongoose from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isStarter: { type: Boolean, default: false },
});

const TestCaseSchema = new Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
});

const ConversationSchema = new Schema({
  sessionId: { type: String, required: true, index: true },

  // Starter conversation metadata
  problemStatement: { type: String, required: true },
  sampleTestCases: [TestCaseSchema],
  hiddenTestCases: [TestCaseSchema],
  userCode: { type: String, default: "" },
  errorOutput: { type: String, default: "" },

  // Chat history
  messages: [MessageSchema],

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Conversation", ConversationSchema);

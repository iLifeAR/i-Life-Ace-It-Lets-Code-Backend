import OpenAI from "openai";
import Conversation from "../model/conversation.js";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT_TEMPLATE = `
You are a helpful and friendly coding assistant designed to guide users through programming challenges step by step.

You already have access to:
- The problem statement,
- Sample and hidden test cases,
- The user's current code (which may be empty, partial, or incorrect),
- Any related error messages.

When initiating the conversation, do **not** thank the user for sharing these — you already have them.

Instead, greet the user briefly and offer help by asking how they would like to proceed. For example:
- Do they want help understanding the problem?
- Would they like a review of their code?
- Are they looking to debug an error?
- Or do they prefer a complete solution?

Avoid giving any solution or hints until the user specifies their preference.

Keep the tone supportive, respectful, and collaborative.
Your goal is to make the user feel in control of the session.
`;

function buildUserContent(problem, code, error) {
  let content = `Problem: ${problem}`;
  if (code) {
    content += `\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
  }
  if (error) {
    content += `\n\nError:\n${error}`;
  }
  return content;
}

export async function startingConversation(req, res) {
  const {
    sessionId,
    problem, // alias for problemStatement
    code,
    error,
    sampleTestCases = [],
    hiddenTestCases = [],
  } = req.body;

  if (!sessionId || !problem) {
    return res
      .status(400)
      .json({ error: "sessionId and problem are required" });
  }

  const now = new Date();

  const systemPrompt = {
    role: "system",
    content: SYSTEM_PROMPT_TEMPLATE,
    isStarter: true,
    timestamp: now,
  };

  const userPrompt = {
    role: "user",
    content: buildUserContent(problem, code, error),
    isStarter: true,
    timestamp: now,
  };

  let conv = await Conversation.findOne({ sessionId });

  if (!conv) {
    conv = new Conversation({
      sessionId,
      problemStatement: problem,
      sampleTestCases,
      hiddenTestCases,
      userCode: code || "",
      errorOutput: error || "",
      messages: [systemPrompt, userPrompt],
    });
  } else {
    conv.problemStatement = problem;
    conv.sampleTestCases = sampleTestCases;
    conv.hiddenTestCases = hiddenTestCases;
    conv.userCode = code || "";
    conv.errorOutput = error || "";
    conv.messages.push(systemPrompt, userPrompt);
  }

  await conv.save();

  const chatRes = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [systemPrompt, userPrompt],
    temperature: 0.7,
  });

  const assistantMsg = {
    ...chatRes.choices[0].message,
    timestamp: new Date(),
  };

  conv.messages.push(assistantMsg);
  await conv.save();

  res.json({ id: chatRes.id, message: assistantMsg });
}

export async function continueConversation(req, res) {
  try {
    const { sessionId, messages } = req.body;

    if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: "sessionId and non-empty messages array are required" });
    }

    let conv = await Conversation.findOne({ sessionId });

    if (!conv) {
      conv = new Conversation({
        sessionId,
        messages: [],
      });
    }

    conv.messages.push(...messages);
    await conv.save();

    const fullMessages = conv.messages;

    const chatRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: fullMessages,
      temperature: 0.7,
    });

    const assistantMsg = chatRes.choices[0].message;

    conv.messages.push(assistantMsg);
    await conv.save();

    res.json({ id: chatRes.id, message: assistantMsg });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: true, reason: err.message });
  }
}

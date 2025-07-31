import OpenAI from "openai";
import Conversation from "../model/conversation.js";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT_TEMPLATE = `
You are a friendly and knowledgeable coding assistant that helps users solve programming problems step by step.

The user will provide:
- A problem statement,
- Sample and hidden test cases,
- Their current code (which may be empty or contain bugs),
- Optional error messages from a compiler or runtime.

Begin each session with a warm, brief introduction.

Do **not** provide a direct solution right away.

Instead, do the following:
1. Acknowledge the user's input (problem, code, test cases, etc.).
2. Politely ask how they would like to proceed:
   - Do they want help understanding the problem?
   - Would they like their code reviewed?
   - Are they looking for debugging help?
   - Or would they prefer to receive a full solution?

Encourage collaborative problem-solving and let the user take control of how much help they want.

Keep your tone encouraging, professional, and supportive. Be concise and avoid overwhelming the user in the first message.
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

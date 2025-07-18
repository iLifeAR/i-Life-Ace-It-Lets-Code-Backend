import OpenAI from "openai";
import CodingAssignment from "../model/codingAssignment.js"
import dotenv from "dotenv";
dotenv.config(); // Load .env variables


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // You should set this in your .env file
});

export const generateCodingAssignment = async (req, res) => {
  try {
    const {
      prompt,
      difficulty,
      assignmentType,
      languagesAllowed,
      sampleTestCount,
      hiddenTestCount,
    } = req.body;

    // Build the universal prompt for OpenAI
    const systemPrompt = `
You are an expert coding assignment generator.

I will give you:
1. A short freeform description of what the teacher wants
2. Difficulty level (Easy, Medium, Hard)
3. Assignment type (function, full_program, algorithm_challenge, real_world_problem, debugging_task, refactoring_task, test_case_creation, api_task)
4. Programming languages allowed
5. Number of sample test cases (visible to students)
6. Number of hidden test cases (used for evaluation)

Your task:
- Try to generate exactly ONE valid assignment.
- If you can generate it, return a JSON object with the following fields:
  - title (short descriptive name)
  - description (clear explanation of the problem)
  - difficulty (must match the provided difficulty)
  - assignment_type (must match the provided type)
  - languages_allowed (must match the provided list)
  - starter_code (must be an object with each allowed language as a key)
  - sample_tests (exactly the requested number, visible to students)
  - hidden_tests (exactly the requested number, for evaluation)
  - time_limit (default: Easy=1s, Medium=2s, Hard=3s)
  - memory_limit (default: Easy=128MB, Medium=256MB, Hard=512MB)
  - tags (array of relevant topics)

For starter_code:
- ALWAYS return an object where keys are the selected programming languages.
- EACH language MUST have minimal working starter code.
- If multiple languages are allowed, include ALL of them.
Example:
"starter_code": {
  "Python": "def solve():\\n    pass",
  "JavaScript": "function solve() {\\n    // TODO\\n}"
}

Important:
- For debugging_task, include intentional bugs in starter_code.
- For refactoring_task, include inefficient but correct code.
- For test_case_creation, give a correct function and ask students to create more tests.
- For api_task, use JSON-like input/output (no real HTTP calls).
- Make test cases meaningful and include edge cases.
- Do NOT include the correct solution.

If you cannot generate a valid assignment for any reason, return this exact JSON:
{
  "error": true,
  "reason": "Explain briefly why this request cannot be turned into a valid programming assignment."
}

Do NOT return any text outside of JSON.
`;

    const userRequest = `Prompt: ${prompt}
Difficulty: ${difficulty}
Assignment Type: ${assignmentType}
Languages Allowed: ${JSON.stringify(languagesAllowed)}
Sample Test Cases: ${sampleTestCount}
Hidden Test Cases: ${hiddenTestCount}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or any model you prefer
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userRequest },
      ],
      temperature: 0.3,
    });

    let aiResponse = completion.choices[0].message.content;

    // Try parsing the JSON response
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(aiResponse);
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: "AI response was not valid JSON. Please try again.",
        raw: aiResponse,
      });
    }

    // If AI returned an error JSON
    if (jsonResponse.error) {
      return res.status(400).json(jsonResponse);
    }

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "difficulty",
      "assignment_type",
      "languages_allowed",
      "starter_code",
      "sample_tests",
      "hidden_tests",
      "time_limit",
      "memory_limit",
      "tags",
    ];
    const hasAllFields = requiredFields.every((field) =>
      Object.prototype.hasOwnProperty.call(jsonResponse, field)
    );

    if (!hasAllFields) {
      return res.status(500).json({
        error: true,
        reason:
          "AI response missing required fields. Please refine your prompt and try again.",
        raw: jsonResponse,
      });
    }

    // ✅ SUCCESS: Return the assignment JSON
    return res.json(jsonResponse);
  } catch (err) {
    console.error("Error generating assignment:", err);
    return res.status(500).json({
      error: true,
      reason: "Server error while generating assignment.",
    });
  }
};



// Save coding assignment
export const saveCodingAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      assignment_type,
      languages_allowed,
      starter_code,
      sample_tests,
      hidden_tests,
      time_limit,
      total_time_limit,
      total_points,
      memory_limit,
      tags,
      createdBy,
    } = req.body;

    // Construct assignment object
    const assignmentData = {
      title: title || "",
      description: description || "",
      difficulty: difficulty || "",
      assignment_type: assignment_type || "",
      languages_allowed: Array.isArray(languages_allowed) ? languages_allowed : [],
      starter_code: typeof starter_code === "object" ? starter_code : {},
      sample_tests: Array.isArray(sample_tests) ? sample_tests : [],
      hidden_tests: Array.isArray(hidden_tests) ? hidden_tests : [],
      time_limit: time_limit || 1,
      total_time_limit: total_time_limit || 30,
      total_points: total_points || 100,
      memory_limit: memory_limit || 128,
      tags: Array.isArray(tags) ? tags : [],
      createdBy: createdBy || undefined, // only if you're passing this
    };

    const newAssignment = new CodingAssignment(assignmentData);
    const saved = await newAssignment.save();

    return res.status(201).json(saved);
  } catch (error) {
    console.error("❌ Error saving assignment:", error);
    return res.status(500).json({ error: true, message: "Failed to save assignment." });
  }
};

// Get all coding assignments
export const getAllCodingAssignments = async (req, res) => {
  try {
    const assignments = await CodingAssignment.find().sort({ createdAt: -1 });
    return res.json(assignments);
  } catch (error) {
    console.error("❌ Error fetching assignments:", error);
    return res.status(500).json({ error: true, message: "Failed to fetch assignments." });
  }
};

// Get a single assignment by ID
export const getSingleCodingAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await CodingAssignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ error: true, message: "Assignment not found." });
    }

    return res.json(assignment);
  } catch (error) {
    console.error("❌ Error fetching single assignment:", error);
    return res.status(500).json({ error: true, message: "Failed to fetch assignment." });
  }
};

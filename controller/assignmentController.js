import OpenAI from "openai";
import CodingAssignment from "../model/codingAssignment.js";
import dotenv from "dotenv";
dotenv.config(); // Load .env variables

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // You should set this in your .env file
});

// export const generateCodingAssignment = async (req, res) => {
//   try {
//     const {
//       prompt,
//       difficulty,
//       assignmentType,
//       languagesAllowed,
//       sampleTestCount,
//       hiddenTestCount,
//       timeLimit,
//       totalPoints,
//     } = req.body;

//     // Build the universal prompt for OpenAI
//     const systemPrompt = `
// You are an expert coding assignment generator.

// I will give you:
// 1. A short freeform description of what the teacher wants
// 2. Difficulty level (Beginner, Intermediate, Advanced)
// 3. Assignment type (function, full_program, algorithm_challenge, real_world_problem, debugging_task, refactoring_task, test_case_creation, api_task)
// 4. Programming languages allowed
// 5. Number of sample test cases (visible to students)
// 6. Number of hidden test cases (used for evaluation)
// 7. Total time limit (seconds)
// 8. Total points (visible to students)

// Your task:
// - Try to generate exactly ONE valid assignment.
// - **Compute points_per_test = total_points ÷ (sample_tests + hidden_tests) and assign that points value to every single test (sample and hidden).**
//   - e.g., if total_points = 100, sample_tests = 2, hidden_tests = 2, then each test must have "points": 25.
// - Include a **points** field on each test case object.
// - Divide the total points evenly across all test cases (both sample and hidden).
// - Include a **points** field on each test case object.
// - If you can generate it, return a JSON object with the following fields:
//   - title (short descriptive name)
//   - description (clear explanation of the problem)
//   - difficulty (must match the provided difficulty)
//   - assignment_type (must match the provided type)
//   - languages_allowed (must match the provided list)
//   - starter_code (must be an object with each allowed language as a key)
//   - sample_tests (exactly the requested number, visible to students; **each** test must include input, output, and points)
//   - hidden_tests (exactly the requested number, for evaluation; **each** test must include input, output, and points)
//   - time_limit (default: Easy=1s, Medium=2s, Hard=3s)
//   - total_time_limit (exactly the requested number, visible to students)
//   - total_points (exactly the requested number, visible to students)
//   - memory_limit (default: Easy=128MB, Medium=256MB, Hard=512MB)
//   - tags (array of relevant topics)

// For starter_code:
// - ALWAYS return an object where keys are the selected programming languages.
// - EACH language MUST have minimal working starter code.
// - If multiple languages are allowed, include ALL of them.
// Example:
// "starter_code": {
//   "Python": "def solve():\\n    pass",
//   "JavaScript": "function solve() {\\n    // TODO\\n}"
// }

// Important:
// - For debugging_task, include intentional bugs in starter_code.
// - For refactoring_task, include inefficient but correct code.
// - For test_case_creation, give a correct function and ask students to create more tests.
// - For api_task, use JSON-like input/output (no real HTTP calls).
// - Make test cases meaningful and include edge cases.
// - Do NOT include the correct solution.

// If you cannot generate a valid assignment for any reason, return this exact JSON:
// {
//   "error": true,
//   "reason": "Explain briefly why this request cannot be turned into a valid programming assignment."
// }

// Do NOT return any text outside of JSON.
// `;

//     const userRequest = `Prompt: ${prompt}
// Difficulty: ${difficulty}
// Assignment Type: ${assignmentType}
// Languages Allowed: ${JSON.stringify(languagesAllowed)}
// total_time_limit: ${timeLimit}
// total_points: ${totalPoints}
// Sample Test Cases: ${sampleTestCount}
// Hidden Test Cases: ${hiddenTestCount}`;

//     // Call OpenAI API
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini", // or any model you prefer
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userRequest },
//       ],
//       temperature: 0.3,
//     });

//     let aiResponse = completion.choices[0].message.content;

//     // Try parsing the JSON response
//     console.log(aiResponse);
//     let jsonResponse;
//     try {
//       jsonResponse = JSON.parse(aiResponse);
//     } catch (err) {
//       return res.status(500).json({
//         error: true,
//         reason: "AI response was not valid JSON. Please try again.",
//         raw: aiResponse,
//       });
//     }

//     // If AI returned an error JSON
//     if (jsonResponse.error) {
//       return res.status(400).json(jsonResponse);
//     }

//     // Validate required fields
//     const requiredFields = [
//       "title",
//       "description",
//       "difficulty",
//       "assignment_type",
//       "languages_allowed",
//       "starter_code",
//       "sample_tests",
//       "hidden_tests",
//       "time_limit",
//       "memory_limit",
//       "tags",
//     ];
//     const hasAllFields = requiredFields.every((field) =>
//       Object.prototype.hasOwnProperty.call(jsonResponse, field)
//     );

//     if (!hasAllFields) {
//       return res.status(500).json({
//         error: true,
//         reason:
//           "AI response missing required fields. Please refine your prompt and try again.",
//         raw: jsonResponse,
//       });
//     }

//     // ✅ SUCCESS: Return the assignment JSON
//     return res.json(jsonResponse);
//   } catch (err) {
//     console.error("Error generating assignment:", err);
//     return res.status(500).json({
//       error: true,
//       reason: "Server error while generating assignment.",
//     });
//   }
// };

// Save coding assignment

export const generateCodingAssignment = async (req, res) => {
  try {
    const {
      prompt,
      difficulty,
      assignmentType,
      languagesAllowed,
      sampleTestCount,
      hiddenTestCount,
      timeLimit,
      totalPoints,
    } = req.body;

    const ALL_LANGUAGES = [
      "Python",
      "JavaScript",
      "Java",
      "C++",
      "Go",
      "C#",
      "Rust",
      "C",
    ];

    const systemPrompt = `
You are an expert coding assignment generator.

You will be given:
1. A short freeform description of what the teacher wants
2. Difficulty level (Beginner, Intermediate, Advanced)
3. Assignment type (function, full_program, algorithm_challenge, real_world_problem, debugging_task, refactoring_task, test_case_creation, api_task)
4. Programming languages allowed
5. Number of sample test cases (visible to students)
6. Number of hidden test cases (used for evaluation)
7. Total time limit (seconds)
8. Total points (visible to students)

Your task:
- Generate exactly ONE valid coding assignment as a JSON object.
- Compute points_per_test = total_points ÷ (sample_tests + hidden_tests) and assign to every test.
- Each test must include "input", "output", and "points".
- Include the following fields in the object:
  - title
  - description
  - difficulty
  - assignment_type
  - languages_allowed
  - starter_code: one valid code snippet for EACH language in this list: ${JSON.stringify(
    ALL_LANGUAGES
  )}
  - sample_tests (EXACTLY the requested number)
  - hidden_tests (EXACTLY the requested number)
  - time_limit
  - total_time_limit
  - total_points
  - memory_limit
  - tags
  - learningObjectives: an array of 3–5 specific technical learning goals students will achieve
  - requirements: 3–6 bullet point requirements the student should meet in the solution
  - examples: 1–3 clear examples of input/output usage
  - hints: 2–4 helpful suggestions for solving the problem

IMPORTANT:
- The final response must be a single valid JSON object.
- If you cannot generate a valid assignment, return:
  { "error": true, "reason": "..." }
`;

    const userRequest = `Prompt: ${prompt}
Difficulty: ${difficulty}
Assignment Type: ${assignmentType}
Languages Allowed: ${JSON.stringify(languagesAllowed)}
Total Time Limit: ${timeLimit}
Total Points: ${totalPoints}
Sample Test Cases: ${sampleTestCount}
Hidden Test Cases: ${hiddenTestCount}

Also generate:
- One valid starter_code for EACH language in ${JSON.stringify(ALL_LANGUAGES)}
- learningObjectives: a list of key skills or concepts covered by this assignment
- requirements: bullet points the student must fulfill
- examples: example usages with inputs and expected outputs
- hints: helpful guidance

Make sure:
- There are exactly ${sampleTestCount} sample_tests and ${hiddenTestCount} hidden_tests.
- All required fields listed in the instructions are included.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userRequest },
      ],
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0].message.content;

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

    if (jsonResponse.error) {
      return res.status(400).json(jsonResponse);
    }

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
      "learningObjectives",
      "requirements", // ✅ newly required
      "examples", // ✅ newly required
      "hints", // ✅ newly required
    ];

    const hasAllFields = requiredFields.every((field) =>
      Object.prototype.hasOwnProperty.call(jsonResponse, field)
    );

    const sampleTestsValid =
      Array.isArray(jsonResponse.sample_tests) &&
      jsonResponse.sample_tests.length === sampleTestCount;

    const hiddenTestsValid =
      Array.isArray(jsonResponse.hidden_tests) &&
      jsonResponse.hidden_tests.length === hiddenTestCount;

    if (!hasAllFields || !sampleTestsValid || !hiddenTestsValid) {
      return res.status(500).json({
        error: true,
        reason: `AI response missing required fields or incorrect test case count.
Expected ${sampleTestCount} sample_tests and ${hiddenTestCount} hidden_tests.`,
        raw: jsonResponse,
      });
    }

    // ✅ Attach the full list of supported languages
    jsonResponse.all_languages = ALL_LANGUAGES;

    return res.json(jsonResponse);
  } catch (err) {
    console.error("❌ Error generating assignment:", err);
    return res.status(500).json({
      error: true,
      reason: "Server error while generating assignment.",
    });
  }
};

export const saveCodingAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      assignment_type,
      languages_allowed,
      all_languages,
      starter_code,
      sample_tests,
      hidden_tests,
      time_limit,
      total_time_limit,
      total_points,
      memory_limit,
      tags,
      learningObjectives, // ✅ added here
      createdBy,
      requirements, // ✅ newly added
      examples, // ✅ newly added
      hints,
      plagiarismCheck, // ✅ newly added
      allowMultipleAttempts, // ✅ newly added
      showHints, // ✅ newly added
      isCompleted, // ✅ newly added
    } = req.body;

    const assignmentData = {
      title: title || "",
      description: description || "",
      difficulty: difficulty || "",
      assignment_type: assignment_type || "",
      languages_allowed: Array.isArray(languages_allowed)
        ? languages_allowed
        : [],
      all_languages: Array.isArray(all_languages) ? all_languages : [],
      starter_code: typeof starter_code === "object" ? starter_code : {},
      sample_tests: Array.isArray(sample_tests) ? sample_tests : [],
      hidden_tests: Array.isArray(hidden_tests) ? hidden_tests : [],
      time_limit: time_limit || 1,
      total_time_limit: total_time_limit || 30,
      total_points: total_points || 100,
      memory_limit: memory_limit || 128,
      tags: Array.isArray(tags) ? tags : [],
      learningObjectives: Array.isArray(learningObjectives)
        ? learningObjectives
        : [], // ✅ added here
      requirements: Array.isArray(requirements) ? requirements : [], // Bullet point list of key requirements
      plagiarismCheck: plagiarismCheck || false,
      allowMultipleAttempts: allowMultipleAttempts || false,
      showHints: showHints || false,
      examples: Array.isArray(examples) ? examples : [], // One or more example
      hints: Array.isArray(hints) ? hints : [], // Optional hints to help students
      isCompleted: isCompleted || false, // ✅ newly added
      createdBy: createdBy || undefined,
    };

    const newAssignment = new CodingAssignment(assignmentData);
    const saved = await newAssignment.save();

    return res.status(201).json(saved);
  } catch (error) {
    console.error("❌ Error saving assignment:", error);
    return res
      .status(500)
      .json({ error: true, message: "Failed to save assignment." });
  }
};

// Get all coding assignments
export const getAllCodingAssignments = async (req, res) => {
  try {
    const assignments = await CodingAssignment.find().sort({ createdAt: -1 });
    return res.json(assignments);
  } catch (error) {
    console.error("❌ Error fetching assignments:", error);
    return res
      .status(500)
      .json({ error: true, message: "Failed to fetch assignments." });
  }
};

// Get a single assignment by ID
export const getSingleCodingAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await CodingAssignment.findById(id);

    if (!assignment) {
      return res
        .status(404)
        .json({ error: true, message: "Assignment not found." });
    }

    return res.json(assignment);
  } catch (error) {
    console.error("❌ Error fetching single assignment:", error);
    return res
      .status(500)
      .json({ error: true, message: "Failed to fetch assignment." });
  }
};

import OpenAI from "openai";
import CodingAssignment from "../model/codingAssignment.js";
import dotenv from "dotenv";
import axios from "axios";

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

//     const ALL_LANGUAGES = [
//       "Python",
//       "JavaScript",
//       "Java",
//       "C++",
//       "Go",
//       "C#",
//       "Rust",
//       "C",
//     ];

//     const systemPrompt = `
// You are an expert coding assignment generator.

// You will be given:
// 1. A short freeform description of what the teacher wants
// 2. Difficulty level (Beginner, Intermediate, Advanced)
// 3. Assignment type (function, full_program, algorithm_challenge, real_world_problem, debugging_task, refactoring_task, test_case_creation, api_task)
// 4. Programming languages allowed
// 5. Number of sample test cases (visible to students)
// 6. Number of hidden test cases (used for evaluation)
// 7. Total time limit (seconds)
// 8. Total points (visible to students)

// Your task:
// - Generate exactly ONE valid coding assignment as a JSON object.
// - Compute points_per_test = total_points ÷ (sample_tests + hidden_tests) and assign to every test.
// - Each test must include "input", "output", and "points".
// - Include the following fields in the object:
//   - title
//   - description
//   - difficulty
//   - assignment_type
//   - languages_allowed
//   - starter_code: one valid code snippet for EACH language in this list: ${JSON.stringify(
//     ALL_LANGUAGES
//   )}
//   - sample_tests (EXACTLY the requested number)
//   - hidden_tests (EXACTLY the requested number)
//   - time_limit
//   - total_time_limit
//   - total_points
//   - memory_limit
//   - tags
//   - learningObjectives: an array of 3–5 specific technical learning goals students will achieve
//   - requirements: 3–6 bullet point requirements the student should meet in the solution
//   - examples: 1–3 clear examples of input/output usage
//   - hints: 2–4 helpful suggestions for solving the problem

// IMPORTANT:
// - The final response must be a single valid JSON object.
// - If you cannot generate a valid assignment, return:
//   { "error": true, "reason": "..." }
// `;

//     const userRequest = `Prompt: ${prompt}
// Difficulty: ${difficulty}
// Assignment Type: ${assignmentType}
// Languages Allowed: ${JSON.stringify(languagesAllowed)}
// Total Time Limit: ${timeLimit}
// Total Points: ${totalPoints}
// Sample Test Cases: ${sampleTestCount}
// Hidden Test Cases: ${hiddenTestCount}

// Also generate:
// - One valid starter_code for EACH language in ${JSON.stringify(ALL_LANGUAGES)}
// - learningObjectives: a list of key skills or concepts covered by this assignment
// - requirements: bullet points the student must fulfill
// - examples: example usages with inputs and expected outputs
// - hints: helpful guidance

// Make sure:
// - There are exactly ${sampleTestCount} sample_tests and ${hiddenTestCount} hidden_tests.
// - All required fields listed in the instructions are included.`;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userRequest },
//       ],
//       temperature: 0.3,
//     });

//     const aiResponse = completion.choices[0].message.content;

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

//     if (jsonResponse.error) {
//       return res.status(400).json(jsonResponse);
//     }

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
//       "learningObjectives",
//       "requirements", // ✅ newly required
//       "examples", // ✅ newly required
//       "hints", // ✅ newly required
//     ];

//     const hasAllFields = requiredFields.every((field) =>
//       Object.prototype.hasOwnProperty.call(jsonResponse, field)
//     );

//     const sampleTestsValid =
//       Array.isArray(jsonResponse.sample_tests) &&
//       jsonResponse.sample_tests.length === sampleTestCount;

//     const hiddenTestsValid =
//       Array.isArray(jsonResponse.hidden_tests) &&
//       jsonResponse.hidden_tests.length === hiddenTestCount;

//     if (!hasAllFields || !sampleTestsValid || !hiddenTestsValid) {
//       return res.status(500).json({
//         error: true,
//         reason: `AI response missing required fields or incorrect test case count.
// Expected ${sampleTestCount} sample_tests and ${hiddenTestCount} hidden_tests.`,
//         raw: jsonResponse,
//       });
//     }

//     // ✅ Attach the full list of supported languages
//     jsonResponse.all_languages = ALL_LANGUAGES;

//     return res.json(jsonResponse);
//   } catch (err) {
//     console.error("❌ Error generating assignment:", err);
//     return res.status(500).json({
//       error: true,
//       reason: "Server error while generating assignment.",
//     });
//   }
// };


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
- Do NOT include markdown or code blocks. Only return a raw JSON object.
- Use function-style solutions only. No input(), console.log, or stdin usage.
- The function name MUST be exactly solve — no variations — in every language (Python, Java, C++, etc).
- Starter code in each language must define a function or method named solve that matches the expected input and output.

INPUT & OUTPUT CONTRACT:
- Based on the prompt, you must infer the correct input type: array, 2D array, number, string, linked list, tree, object, or none.
- Input will be passed as a parsed JSON-compatible value.
- If the input is a tree or linked list, assume globally defined classes (TreeNode or ListNode) exist.
- The function should accept exactly one argument based on the detected input structure.
- The function must return the result, not print it.
- The returned value will be automatically serialized (e.g., listToArray for ListNode, etc.).

Return the result in this exact JSON format (include "inferred_input_shape" to indicate what input type you inferred):

{
  "title": "",
  "description": "",
  "difficulty": "",
  "assignment_type": "",
  "languages_allowed": ${JSON.stringify(languagesAllowed)},
  "starter_code": { "Python": "...", "JavaScript": "...", ... },
  "language_wrappers": {
    "Python": "...",
    "JavaScript": "...",
    "Java": "...",
    "C++": "...",
    "Go": "...",
    "C#": "...",
    "Rust": "...",
    "C": "..."
  },
  "sample_tests": [ { "input": "...", "output": "...", "points": ... } ],
  "hidden_tests": [ { "input": "...", "output": "...", "points": ... } ],
  "time_limit": ${timeLimit},
  "total_time_limit": ${timeLimit},
  "total_points": ${totalPoints},
  "memory_limit": 128,
  "tags": [],
  "learningObjectives": [],
  "requirements": [],
  "examples": [],
  "hints": [],
  "inferred_input_shape": ""
}

- First, infer the input shape and expected return type from the prompt, then generate:
  - A single unified input shape string (e.g., "array", "2d_array", "string", "tree_array", "linked_list_array", "object", etc.) in the field "inferred_input_shape"
  - Sample and hidden test cases based on the inferred shape
  - Starter code for each language listed in "languages_allowed" using a function called solve(input)
- Then, for each language, dynamically generate a wrapper using the following format:

Each wrapper must:
  - Contain exactly two placeholders: "{{code}}" and "{{input}}"
  - The AI must NOT hardcode the function implementation inside the wrapper
  - "{{code}}" will be replaced with the student's code (e.g., the solve function)
  - "{{input}}" will be replaced with the actual test case input as a string (JSON format)
  - The wrapper must:
    - Parse "{{input}}" into a native structure (array, int, object, etc.)
    - Call the "solve(...)" function with the parsed input
    - Print or return the result correctly (without additional logging)
    - Match the input/output signature of the generated starter_code
    - Not use stdin, command-line args, or user input (e.g., no "input()", "scanf", "cin", "Scanner", etc.)
    - Not print debug output, logging, or wrapper-only messages

`.trim();

    const userPrompt = `Prompt: ${prompt}
Difficulty: ${difficulty}
Assignment Type: ${assignmentType}
Languages Allowed: ${JSON.stringify(languagesAllowed)}
Sample Test Cases: ${sampleTestCount}
Hidden Test Cases: ${hiddenTestCount}
Total Time Limit: ${timeLimit}
Total Points: ${totalPoints}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    let aiResponse = completion.choices[0].message.content.trim();

    // Remove accidental markdown formatting
    if (aiResponse.startsWith("```json") || aiResponse.startsWith("```")) {
      aiResponse = aiResponse.replace(/```json|```/g, "").trim();
    }

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
      "language_wrappers", // ✅ required now
      "sample_tests",
      "hidden_tests",
      "time_limit",
      "memory_limit",
      "tags",
      "learningObjectives",
      "requirements",
      "examples",
      "hints",
      "inferred_input_shape", // ✅ Required
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

    jsonResponse.all_languages = ALL_LANGUAGES;
    console.log(jsonResponse);

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
      language_wrappers,
      sample_tests,
      hidden_tests,
      time_limit,
      total_time_limit,
      total_points,
      memory_limit,
      tags,
      learningObjectives,
      createdBy,
      requirements,
      examples,
      hints,
      plagiarismCheck,
      allowMultipleAttempts,
      showHints,
      isCompleted,
      inputShape,
    } = req.body;

    const assignmentData = {
      title: title || "",
      description: description || "",
      difficulty: difficulty || "",
      assignment_type: assignment_type || "",
      languages_allowed: Array.isArray(languages_allowed) ? languages_allowed : [],
      all_languages: Array.isArray(all_languages) ? all_languages : [],
      starter_code: typeof starter_code === "object" ? starter_code : {},
      language_wrappers: typeof language_wrappers === "object" ? language_wrappers : {},
      sample_tests: Array.isArray(sample_tests) ? sample_tests : [],
      hidden_tests: Array.isArray(hidden_tests) ? hidden_tests : [],
      time_limit: time_limit || 1,
      total_time_limit: total_time_limit || 30,
      total_points: total_points || 100,
      memory_limit: memory_limit || 128,
      tags: Array.isArray(tags) ? tags : [],
      learningObjectives: Array.isArray(learningObjectives) ? learningObjectives : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      plagiarismCheck: plagiarismCheck || false,
      allowMultipleAttempts: allowMultipleAttempts || false,
      showHints: showHints || false,
      isCompleted: isCompleted || false,
      inputShape: inputShape || "array",
      createdBy: createdBy || undefined,
      hints: Array.isArray(hints) ? hints : [],
    };

    if (Array.isArray(examples)) {
      assignmentData.examples = examples.map((ex) => {
        if (typeof ex === "string") {
          const parts = ex.split(/should return/i);
          return {
            input: parts[0]?.trim() || "",
            output: parts[1]?.trim() || "",
          };
        }
        return ex;
      });
    } else {
      assignmentData.examples = [];
    }

    // ✅ Internal function to test and fix wrappers
    const validateAndFixWrappers = async () => {
      const failures = [];
      const test = sample_tests?.[0];
      const langMap = {
        Python: "python3",
        JavaScript: "javascript",
        Java: "java",
        "C++": "cpp",
        Go: "go",
        "C#": "csharp",
        Rust: "rust",
        C: "c",
      };

      for (const lang of languages_allowed) {
        const wrapper = language_wrappers[lang];
        const code = starter_code[lang];
        const pistonLang = langMap[lang];

        if (!wrapper || !code || !test || !pistonLang) {
          console.log(`⚠️ Skipping ${lang}: Missing wrapper, code, test, or unsupported language`);
          continue;
        }

        const testCode = wrapper
          .replace("{{code}}", code)
          .replace("{{input}}", JSON.stringify(test.input));

        console.log(`🧪 Testing ${lang} wrapper...`);

        try {
          const result = await axios.post("https://emkc.org/api/v2/piston/execute", {
            language: pistonLang,
            source: testCode,
          });

          const output = result.data.output?.trim() || result.data.run?.output?.trim() || "";
          const expected = test.output?.toString().trim();

          if (!output || output !== expected) {
            console.log(`❌ ${lang} wrapper failed.`);
            console.log(`   🔸 Input: ${JSON.stringify(test.input)}`);
            console.log(`   🔸 Expected: ${expected}`);
            console.log(`   🔸 Actual: ${output}`);
            failures.push({ lang, code, input: test.input, expected, actual: output });
          } else {
            console.log(`✅ ${lang} wrapper passed.`);
          }
        } catch (err) {
          console.log(`❌ ${lang} execution error: ${err.message}`);
          failures.push({ lang, code, input: test.input, expected: test.output, actual: err.message });
        }
      }

      // 🔁 Fix broken wrappers using GPT
      for (const fail of failures) {
        console.log(`🔁 Regenerating wrapper for ${fail.lang} using GPT...`);

        const gptPrompt = `
The wrapper for ${fail.lang} did not work correctly.
Please regenerate ONLY the wrapper using {{code}} and {{input}}.
Use the following:

Starter Code:
${fail.code}

Test Input (JSON):
${JSON.stringify(fail.input)}

Expected Output:
${fail.expected}

Actual Output:
${fail.actual}

Return ONLY:
{
  "language": "${fail.lang}",
  "wrapper": "..."
}
        `.trim();

        const response = await openai.createChatCompletion({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a language wrapper generator for code execution." },
            { role: "user", content: gptPrompt },
          ],
          temperature: 0,
        });

        const content = response.data.choices[0].message.content.trim();
        const fixed = JSON.parse(content);

        if (fixed.language && fixed.wrapper) {
          console.log(`✅ Wrapper for ${fixed.language} updated successfully.`);
          language_wrappers[fixed.language] = fixed.wrapper;
        } else {
          console.log(`❌ GPT failed to fix wrapper for ${fail.lang}`);
        }
      }
    };

    console.log("🔍 Starting wrapper validation...");
    await validateAndFixWrappers();
    console.log("✅ Wrapper validation complete. Saving assignment...");

    const newAssignment = new CodingAssignment({
      ...assignmentData,
      language_wrappers,
    });

    const saved = await newAssignment.save();

    console.log("✅ Assignment saved to DB.");
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

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
// - Do NOT include markdown or code blocks. Only return a raw JSON object.
// - Use function-style solutions only. No input(), console.log, or stdin usage.
// - The function name MUST be exactly solve — no variations — in every language (Python, Java, C++, etc).
// - Starter code in each language must define a function or method named solve that matches the expected input and output.

// INPUT & OUTPUT CONTRACT:
// - Based on the prompt, you must infer the correct input type: array, 2D array, number, string, linked list, tree, object, or none.
// - Input will be passed as a parsed JSON-compatible value.
// - If the input is a tree or linked list, assume globally defined classes (TreeNode or ListNode) exist.
// - The function should accept exactly one argument based on the detected input structure.
// - The function must return the result, not print it.
// - The returned value will be automatically serialized (e.g., listToArray for ListNode, etc.).

// Return the result in this exact JSON format (include "inferred_input_shape" to indicate what input type you inferred):
// {
//   "title": "",
//   "description": "",
//   "difficulty": "",
//   "assignment_type": "",
//   "languages_allowed": ${JSON.stringify(languagesAllowed)},
//   "starter_code": { "Python": "...", "JavaScript": "...", ... },
//   "sample_tests": [ { "input": "...", "output": "...", "points": ... } ],
//   "hidden_tests": [ { "input": "...", "output": "...", "points": ... } ],
//   "time_limit": ${timeLimit},
//   "total_time_limit": ${timeLimit},
//   "total_points": ${totalPoints},
//   "memory_limit": 128,
//   "tags": [],
//   "learningObjectives": [],
//   "requirements": [],
//   "examples": [],
//   "hints": [],
//   "inferred_input_shape": ""
// }
// - Compute points_per_test = total_points / (sample + hidden)
// - Ensure all inputs and outputs match the expected function signature
// - Validate all sample and hidden tests with the logic in starter_code
// `.trim();

//     const userPrompt = `Prompt: ${prompt}
// Difficulty: ${difficulty}
// Assignment Type: ${assignmentType}
// Languages Allowed: ${JSON.stringify(languagesAllowed)}
// Sample Test Cases: ${sampleTestCount}
// Hidden Test Cases: ${hiddenTestCount}
// Total Time Limit: ${timeLimit}
// Total Points: ${totalPoints}
// `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt },
//       ],
//       temperature: 0.3,
//     });

//     let aiResponse = completion.choices[0].message.content.trim();

//     // Remove accidental markdown formatting
//     if (aiResponse.startsWith("```json") || aiResponse.startsWith("```")) {
//       aiResponse = aiResponse.replace(/```json|```/g, "").trim();
//     }

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
//       "requirements",
//       "examples",
//       "hints",
//       "inferred_input_shape", // ✅ Required
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

async function generatingRunnableCode(jsonResponse) {
  const langs = Object.keys(jsonResponse.starter_code);

  const tasks = langs.map((lang) => {
    const starter = jsonResponse.starter_code[lang];
    const sampleTests = jsonResponse.sample_tests;
    const hiddenTests = jsonResponse.hidden_tests;
    const description = jsonResponse.description;

    console.log(
      "sampleTests, hidden_tests, starter, description",
      sampleTests,
      hiddenTests,
      starter,
      description
    );

    const systemprompt = `
You are a world-class ${lang} developer.

Your task is to generate a complete, runnable ${lang} program that wraps around a student's function.  
Leave exactly one placeholder: {{code}} (on its own line, exactly as shown — do NOT modify or move it into another expression).  
*Do NOT include any import statements.*

Requirements:
1. Add necessary boilerplate (e.g., entry point).
2. Insert {{code}} at the top of the file, before any test logic. Do NOT define or repeat the student’s function — it will be inserted at {{code}}.
3. Define test cases exactly as received from the user, using a single variable appropriate and valid to the language (e.g., "const tests = [...]" in JavaScript, "tests = [...]" in Python and so on).
4. For each test case:
   - Call the student’s function with test.input
   - Print ONLY the output
5. Final code must be fully runnable once {{code}} is replaced.

Return only the source code, without code fences, markdown, or explanations.
`;

    const userprompt = `
STARTER CODE:
${starter}

TEST CASES:
${JSON.stringify([...sampleTests, ...hiddenTests], null, 2)}
`;

    return openai.chat.completions
      .create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: systemprompt },
          { role: "user", content: userprompt },
        ],
      })
      .then((completion) => {
        let code = completion.choices[0].message.content
          .trim()
          .replace(/^```(\w+)?/, "")
          .replace(/```$/, "");
        return { lang, code };
      });
  });

  const results = await Promise.all(tasks);

  jsonResponse.runnable_code = results.reduce((acc, { lang, code }) => {
    acc[lang] = code;
    return acc;
  }, {});

  return jsonResponse;
}

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

    // System prompt generator for shared assignment metadata
    const buildSystemPromptForMetadata = () => `
You are an expert instructional designer for programming courses.
You will receive exactly four inputs:
1. A short, free-form description of what the teacher wants.
2. A difficulty level: one of "Beginner", "Intermediate", or "Advanced".
3. An assignment type: one of:
   • full_program         – build an end-to-end executable program with I/O
   • debugging_task       – find and correct errors in existing code   
4. A list of allowed programming languages (e.g. ["Python", "JavaScript"]).
5. sample_tests: number of sample tests needed
6. hidden_tests: number of hidden tests needed

Your task: produce only one JSON object containing these keys:
- "title"               (string): concise assignment name
- "description"         (string): detailed problem statement
- "difficulty"          (string): exactly the provided level
- "assignment_type"     (string): exactly the provided type
- "languages_allowed"   (array) : exactly the provided list
- "time_limit"          (number): in seconds
- "memory_limit"        (number): in megabytes
- "learningObjectives"  (array of strings): what the student will learn
- "requirements"        (array of strings): prerequisites only not setup needed
- "tags"                (array of strings): relevant keywords
- "examples"            (array of objects): [{ "input": "...", "output": "..." }, ...] at least one example test case
- "hints"               (array of strings): optional guidance for students
- "sample_tests"        (array of objects): [{"input":"...","expected":"..."}, ...] based on sample_tests
- "hidden_tests"        (array of objects): [{"input":"...","expected":"..."}, ...] based on hidden_tests

Constraints:
- Do NOT include any code, test cases, or I/O examples outside of the fields above.
- Do NOT output extra keys or any commentary.
- Return strictly one valid JSON object.
- If you cannot generate valid metadata, return exactly:
  {
    "error": true,
    "reason": "brief explanation"
  }
`;

    // System prompt generator for language‑specific assignment content
    const buildSystemPromptForLanguageSpecifics = () => `
You are an expert prompt engineer and coding-assignment generator.

Input:
A JSON metadata object with the following fields:
- title: assignment title
- description: detailed problem description
- difficulty: one of "Beginner", "Intermediate", or "Advanced"
- assignment_type: one of "full_program", "debugging_task", or "output_formatting"
- languages_allowed: list of allowed languages (e.g. ["Python", "JavaScript"])
- time_limit: max runtime (e.g., "1s", "2s")
- memory_limit: max memory usage (e.g., "256MB")
- tags: array of keywords
- sample_tests_count: number of sample tests
- hidden_tests_count: number of hidden tests
- language: specific language for code generation (must match one from languages_allowed)
- sample_tests: [ {"input":"...","expected":"..."}, ... ],
- hidden_tests: [ {"input":"...","expected":"..."}, ... ],

Task Rules:

If assignment_type == "full_program":
  • Under no circumstance should you include real input/output parsing, calculations, or print statements. All logic should be stubbed out or commented with TODO markers.
  • Generate a complete program or script **scaffold** (not working code).
  • Do NOT write actual logic — use only TODO comments and placeholders but just as guide, not actual code.
  • Show comments for:
      - where to parse input
      - where to perform computation
      - where to print or output results
  • DO NOT include any executable logic — only structure and comments.
  • DO NOT include instructions on how to run the program.
  • Include all sample_tests and hidden_tests at the end of the code as comments.
    - Format: 
      # Sample Test Cases:
      # Input: ...
      # Expected Output: ...
      # Hidden Test Cases:
      # Input: ...
      # Input: ...

If assignment_type == "debugging_task":
  • Provide a buggy code scaffold with AT LEAST one intentional bug.
  • Wrap the buggy region with:
      /* === START BUGGY CODE === */
      ...broken code...
      /* === END BUGGY CODE === */
  • Bug should be a simple omission or off-by-one error.
  • Do NOT specify line numbers or explicitly point out where the bug lives.
  • Include comments listing sample & hidden test cases:
      - Sample Test Cases should show both inputs and expected outputs.
      - Hidden Test Cases should show only inputs (no expected outputs).

Common Guidelines:
- Use exactly the provided "language".
- Output only one JSON object:
  {
    "language": "<language>",
    "full_code": "<escaped source code>",    
  }
- In "full_code":
  • Mark editable region:
      # === START STUDENT CODE ===
      ...student code or BUGGY CODE...
      # === END STUDENT CODE ===
  • Escape all quotes and newlines (\" and \n) for valid JSON.
  • Use only the given test cases and hidden tests from the metadata.
  • Do NOT include actual test harness code—only comments guiding where to run tests.
  
- If generation is impossible, return:
  {"error": true, "reason": "brief explanation"}
`;

    // If assignment_type == "output_formatting":
    //   • Provide a stub function or script for formatting output.
    //   • Do NOT implement processing logic—use TODO placeholders.
    //   • Add comment examples showing raw input vs desired formatted output.
    //   • Include comments listing sample & hidden test inputs and expected outputs.

    let metadata;
    try {
      const metaCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: buildSystemPromptForMetadata() },
          {
            role: "user",
            content: `Prompt: ${prompt}\nDifficulty: ${difficulty}\nAssignment Type: ${assignmentType}\nSample Tests: ${sampleTestCount}\nHidden Tests: ${hiddenTestCount}\nLanguages Allowed: ${JSON.stringify(
              languagesAllowed
            )}`,
          },
        ],
        temperature: 0.3,
      });

      let metaContent = metaCompletion.choices[0].message.content.trim();
      if (metaContent.startsWith("```")) {
        metaContent = metaContent.replace(/```json|```/g, "").trim();
      }
      metadata = JSON.parse(metaContent);
      if (metadata.error) throw new Error(metadata.reason);

      console.log("[generateCodingAssignment] Shared metadata:", metadata);
    } catch (err) {
      console.error("❌ Error generating metadata:", err);
      return res.status(500).json({ error: true, reason: err.message });
    }

    metadata.full_code = {};

    const assignmentPromises = languagesAllowed.map(async (lang) => {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: buildSystemPromptForLanguageSpecifics() },
          {
            role: "user",
            content: `Metadata: ${JSON.stringify(metadata)}\nLanguage: ${lang}`,
          },
        ],
        temperature: 0.3,
      });

      let aiResponse = completion.choices[0].message.content.trim();
      if (aiResponse.startsWith("```")) {
        aiResponse = aiResponse.replace(/```json|```/g, "").trim();
      }
      const langData = JSON.parse(aiResponse);
      if (langData.error) throw new Error(langData.reason);

      metadata.full_code[lang] = langData.full_code;

      console.log(
        `[generateCodingAssignment] Generated for ${lang}:`,
        langData
      );
      return lang;
    });

    try {
      await Promise.all(assignmentPromises);
    } catch (err) {
      console.error("❌ Error generating language specifics:", err);
      return res.status(500).json({ error: true, reason: err.message });
    }

    console.log("[generateCodingAssignment] Final payload:", metadata);

    return res.json(metadata);
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
      full_code,
      sample_tests,
      runnable_code,
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
      languages_allowed: Array.isArray(languages_allowed)
        ? languages_allowed
        : [],
      all_languages: Array.isArray(all_languages) ? all_languages : [],

      // ✅ Changed from starter_code to full_code
      full_code: typeof full_code === "object" ? full_code : {},

      // ✅ Changed from arrays to Maps/objects for language-specific tests
      sample_tests:
        typeof sample_tests === "object" && !Array.isArray(sample_tests)
          ? sample_tests
          : {},
      hidden_tests:
        typeof hidden_tests === "object" && !Array.isArray(hidden_tests)
          ? hidden_tests
          : {},

      time_limit: time_limit || 1,
      total_time_limit: total_time_limit || 30,
      total_points: total_points || 100,
      memory_limit: memory_limit || 128,
      tags: Array.isArray(tags) ? tags : [],
      learningObjectives: Array.isArray(learningObjectives)
        ? learningObjectives
        : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      plagiarismCheck: plagiarismCheck || false,
      allowMultipleAttempts: allowMultipleAttempts || false,
      runnable_code:
        typeof runnable_code === "object" && !Array.isArray(runnable_code)
          ? runnable_code
          : {},
      showHints: showHints || false,
      isCompleted: isCompleted || false,
      inputShape: inputShape || "array",
      createdBy: createdBy || undefined,
      hints: Array.isArray(hints) ? hints : [],
    };

    // ✅ Transform examples to proper format if they are strings
    if (Array.isArray(examples)) {
      assignmentData.examples = examples.map((ex) => {
        if (typeof ex === "string") {
          const parts = ex.split(/should return/i);
          return {
            input: parts[0]?.trim() || "",
            output: parts[1]?.trim() || "",
          };
        }
        return ex; // already in correct object format
      });
    } else {
      assignmentData.examples = [];
    }

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

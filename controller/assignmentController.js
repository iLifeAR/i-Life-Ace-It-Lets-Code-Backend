import OpenAI from "openai";
import CodingAssignment from "../model/codingAssignment.js";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  • DO NOT explicetlly include instructions on how to run the program or the code itself just todos.
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

// Get all coding assignments
import PractiseAssignment from "../model/practiseAssignment.js";

export const getAllPractiseAssignments = async (req, res) => {
  try {
    const assignments = await PractiseAssignment.find().sort({ createdAt: -1 });
    
    return res.json(assignments);
  } catch (error) {
    console.error("❌ Error fetching assignments:", error);
    return res
      .status(500)
      .json({ error: true, message: "Failed to fetch assignments." });
  }
};

// Get a single assignment by ID
export const getSinglePractiseAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await PractiseAssignment.findById(id);

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

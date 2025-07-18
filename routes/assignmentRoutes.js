// routes/assignments.js
import express from "express";
import { generateCodingAssignment, getAllCodingAssignments, getSingleCodingAssignment, saveCodingAssignment } from "../controller/assignmentController.js";
const router = express.Router();

router.post("/generate", generateCodingAssignment);
router.post("/save", saveCodingAssignment); // Save to DB
router.get("/", getAllCodingAssignments); // All assignments
router.get("/:id", getSingleCodingAssignment); // One assignment by ID

export default router;

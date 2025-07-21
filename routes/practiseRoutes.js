// routes/assignments.js
import express from "express";
import { getAllPractiseAssignments, getSinglePractiseAssignment } from "../controller/practiseController.js";
const router = express.Router();

router.get("/", getAllPractiseAssignments); // All assignments
router.get("/:id", getSinglePractiseAssignment); // One assignment by ID

export default router;

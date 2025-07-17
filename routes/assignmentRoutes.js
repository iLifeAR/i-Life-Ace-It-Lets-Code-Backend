// routes/assignments.js
import express from "express";
import { generateCodingAssignment } from "../controller/assignmentController.js";
const router = express.Router();

router.post("/generate", generateCodingAssignment);

export default router;

import express from "express";
import {
  startingConversation,
  continueConversation,
} from "../controller/chatController.js";

const router = express.Router();

router.post("/", startingConversation);
router.post("/continue", continueConversation);

export default router;

import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { getMessages, sendMessage, getConversations } from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", isLoggedIn, getConversations);
router.get("/:otherUserId", isLoggedIn, getMessages);
router.post("/", isLoggedIn, sendMessage);

export default router;

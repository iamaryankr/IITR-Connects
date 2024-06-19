import express from "express";
import {
	followUnFollowUser,
	getUserProfile,
	loginUser,
	logoutUser,
	signupUser,
	updateUser,
	getSuggestedUsers,
	freezeAccount,
} from "../controllers/userController.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.get("/suggested", isLoggedIn, getSuggestedUsers);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", isLoggedIn, followUnFollowUser); // Toggle state(follow/unfollo)
router.put("/update/:id", isLoggedIn, updateUser);
router.put("/freeze", isLoggedIn, freezeAccount);

export default router;

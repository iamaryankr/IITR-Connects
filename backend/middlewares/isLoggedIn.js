import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ExpressError from "../utils/ExpressError.js";
import { errorHandler } from "../utils/errorHandler.js";

export const isLoggedIn = errorHandler(async (req, res, next) => {
	const token = req.cookies.jwt;

	if (!token) {
		throw new ExpressError('Unauthorized', 401);
	}

	const decoded = jwt.verify(token, process.env.JWT_SECRET);

	const user = await User.findById(decoded.userId).select("-password");
	req.user = user;

	next();
});

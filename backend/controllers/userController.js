import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { errorHandler } from "../utils/errorHandler.js";
import ExpressError from "../utils/ExpressError.js";

export const getUserProfile = errorHandler(async (req, res) => {
	// We will fetch user profile either with username or userId
	// query is either username or userId
	const { query } = req.params;

	let user;

	// query is userId
	if (mongoose.Types.ObjectId.isValid(query)) {
		user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
	} else {
		// query is username
		user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
	}

	if(!user) throw new ExpressError('User not found', 404);

	res.status(200).json(user);
});

export const signupUser = errorHandler(async (req, res) => {
	const { name, email, username, password, year, branch } = req.body;
	const user = await User.findOne({ $or: [{ email }, { username }] });

	if (user) {
		throw new ExpressError("User already exists", 400);
	}
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	const newUser = new User({
		name,
		email,
		username,
		password: hashedPassword,
		year,
		branch
	});
	await newUser.save();

	if(!newUser) {
		throw new ExpressError("Invalid user data", 400);
	}

	generateTokenAndSetCookie(newUser._id, res);
	res.status(201).json({
		_id: newUser._id,
		name: newUser.name,
		email: newUser.email,
		username: newUser.username,
		bio: newUser.bio,
		profilePic: newUser.profilePic,
		year: newUser.year,
		branch: newUser.branch
	});

});

export const loginUser = errorHandler(async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username });
	const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

	if (!user || !isPasswordCorrect) {
		throw new ExpressError("Invalid username or password", 400);
	}

	if (user.isFrozen) {
		user.isFrozen = false;
		await user.save();
	}

	generateTokenAndSetCookie(user._id, res);

	res.status(200).json({
		_id: user._id,
		name: user.name,
		email: user.email,
		username: user.username,
		profilePic: user.profilePic,
		branch: user.branch,
		year: user.year,
	});
});

export const logoutUser = errorHandler((req, res) => {
	res.cookie("jwt", "", { maxAge: 1 });
	res.status(200).json({ message: "User logged out successfully" });
});

export const followUnFollowUser = errorHandler(async (req, res) => {
	const { id } = req.params;
	const userToModify = await User.findById(id);
	const currentUser = await User.findById(req.user._id);

	if (id === req.user._id.toString()) {
		throw new ExpressError("You cannot follow/unfollow yourself", 400)
	}

	if (!userToModify || !currentUser) {
		throw new ExpressError("User not found", 400)
	}

	const isFollowing = currentUser.following.includes(id);

	if (isFollowing) {
		// Unfollow user
		await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
		await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
		res.status(200).json({ message: "User unfollowed successfully" });
	} else {
		// Follow user
		await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
		await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
		res.status(200).json({ message: "User followed successfully" });
	}
});

export const updateUser = errorHandler(async (req, res) => {
	const { name, email, username, password, year, branch } = req.body;
	let { profilePic } = req.body;

	const userId = req.user._id;
	let user = await User.findById(userId);
	if (!user) {
		throw new ExpressError('User not found', 400);
	}

	if (req.params.id !== userId.toString()) {
		throw new ExpressError("Can not update user ", 403)
	}

	if (password) {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		user.password = hashedPassword;
	}

	if (profilePic) {
		if (user.profilePic) {
			await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
		}

		const uploadedResponse = await cloudinary.uploader.upload(profilePic);
		profilePic = uploadedResponse.secure_url;
	}

	user.name = name || user.name;
	user.email = email || user.email;
	user.username = username || user.username;
	user.profilePic = profilePic || user.profilePic;
	user.branch = branch || user.branch;
	user.year = year || user.year;
	// user.bio = bio || user.bio;

	user = await user.save();

	// Find all posts that this user replied and update username and userProfilePic fields
	await Post.updateMany(
		{ "replies.userId": userId },
		{
			$set: {
				"replies.$[reply].username": user.username,
				"replies.$[reply].userProfilePic": user.profilePic,
			},
		},
		{ arrayFilters: [{ "reply.userId": userId }] }
	);

	res.status(200).json({
		name: user.name,
		email: user.email,
		username: user.username,
		profilePic: user.profilePic,
		branch: user.branch,
		year: user.year
	});
});

export const getSuggestedUsers = errorHandler(async (req, res) => {
	// exclude the current user from suggested users array and exclude users that current user is already following
	const userId = req.user._id;

	const usersFollowedByYou = await User.findById(userId).select("following");

	const users = await User.aggregate([
		{
			$match: {
				_id: { $ne: userId },
			},
		},
		{
			$sample: { size: 10 },
		},
	]);
	const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
	const suggestedUsers = filteredUsers.slice(0, 4);

	const suggestions = suggestedUsers.map(user => {
		const u =  {
			...user,
		}
		delete u.password;
		return u;
	});

	res.status(200).json(suggestions);
});

export const freezeAccount = errorHandler(async (req, res) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		throw new ExpressError('User not Found', 400);
	}

	user.isFrozen = true;
	await user.save();

	res.status(200).json({ success: true });
});

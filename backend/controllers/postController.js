import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import { errorHandler } from "../utils/errorHandler.js";
import ExpressError from "../utils/ExpressError.js";

export const createPost = errorHandler(async (req, res) => {
	const { postedBy, text } = req.body;
	let { img } = req.body;

	if (!postedBy || !text) {
		throw new ExpressError('Postedby and text fields are required', 400);
	}

	const user = await User.findById(postedBy);
	if (!user) {
		throw new ExpressError("User not found", 400);
	}

	if (user._id.toString() !== req.user._id.toString()) {
		throw new ExpressError("Unauthorized to create post", 401);
	}

	const maxLength = 500;
	if (text.length > maxLength) {
		throw new ExpressError(`Text must be less than ${maxLength} characters`, 401);
	}

	if (img) {
		const uploadedResponse = await cloudinary.uploader.upload(img);
		img = uploadedResponse.secure_url;
	}

	const newPost = new Post({ postedBy, text, img });
	await newPost.save();

	res.status(201).json(newPost);
});

export const getPost = errorHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);

	if (!post) {
		throw new ExpressError("Post not found", 404);
	}

	res.status(200).json(post);
});

export const deletePost = errorHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);
	if (!post) {
		throw new ExpressError("Post not found", 404);
	}

	if (post.postedBy.toString() !== req.user._id.toString()) {
		throw new ExpressError("Unauthorized to delete post", 401);
	}

	if (post.img) {
		const imgId = post.img.split("/").pop().split(".")[0];
		await cloudinary.uploader.destroy(imgId);
	}

	await Post.findByIdAndDelete(req.params.id);

	res.status(200).json({ message: "Post deleted successfully" });
});

export const likeUnlikePost = errorHandler(async (req, res) => {
	const { id: postId } = req.params;
	const userId = req.user._id;

	const post = await Post.findById(postId);

	if (!post) {
		throw new ExpressError("Post not found", 404);
	}

	const userLikedPost = post.likes.includes(userId);

	if (userLikedPost) {
		// Unlike post
		await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
		res.status(200).json({ message: "Post unliked" });
	} else {
		// Like post
		post.likes.push(userId);
		await post.save();
		res.status(200).json({ message: "Post liked" });
	}
});

export const replyToPost = errorHandler(async (req, res) => {
	const { text } = req.body;
	const postId = req.params.id;
	const userId = req.user._id;
	const userProfilePic = req.user.profilePic;
	const username = req.user.username;

	if (!text) {
		throw new ExpressError("Text field is required", 400);
	}

	const post = await Post.findById(postId);
	if (!post) {
		throw new ExpressError("Post not found", 400);
	}

	const reply = { userId, text, userProfilePic, username };

	post.replies.push(reply);
	await post.save();

	res.status(200).json(reply);
});

export const getFeedPosts = errorHandler(async (req, res) => {
	const userId = req.user._id;
	const user = await User.findById(userId);
	if (!user) {
		throw new ExpressError("User not found", 404);
	}

	const following = user.following;

	const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });

	res.status(200).json(feedPosts);

});

export const getUserPosts = errorHandler(async (req, res) => {
	const { username } = req.params;
	const user = await User.findOne({ username });
	if (!user) {
		throw new ExpressError("User not found", 404);
	}

	const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });

	res.status(200).json(posts);
});

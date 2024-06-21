import path from "path";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import {v2 as cloudinary} from "cloudinary";
import messageRoutes from "./routes/messageRoutes.js";
import { app, server } from "./socket/socket.js";
//import job from "./cron/cron.js";

// backend => port 8080
// front-end => port 3000


//job.start();

if(process.env.NODE_ENV !== 'production') {
	dotenv.config();
}

connectDB();

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middlewares1
app.use(express.json({ limit: "50mb" })); // To parse JSON data in the req.body
app.use(express.urlencoded({ extended: true })); // To parse form data in the req.body
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === 'development') {
	app.use(express.static(path.join(__dirname, "/front-end/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "front-end", "dist", "index.html"));
	});
}

// // Error Handling middleware
app.use((err, req, res, next) => {
	console.log(`Error encountered: ${err.message}`);
	res.status(err.code).json({ error: err.message });
});

server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));

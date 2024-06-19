import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";


const connectDB = async () => {
	try {
		// Mongo connection
		const url = process.env.MONGO_URI;
		const conn = await mongoose.connect(url, {
			// To avoid warnings in the console
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		// Cloudinary connectioon
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});

		console.log(`Connection to DB and cloudinary successful.\nDB host: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		process.exit(1);
	}
};

export default connectDB;

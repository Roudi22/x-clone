import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import {v2 as cloudinary} from "cloudinary";
export const createPost = async (req, res) => {
    try {
          const { text } = req.body;
          let { image } = req.body;
          const currentUserId = req.user._id.toString();
          const user = await User.findById(currentUserId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (!text && !image) {
                return res.status(400).json({ message: "Text or image is required" });
            }
            if (image) {
                const uploadedResponse = await cloudinary.uploader.upload(image);
                image = uploadedResponse.secure_url;
            }
            const newPost = new Post({ text, image, user: currentUserId });
            await newPost.save();
            res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
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

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id.toString();
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (post.user.toString() !== currentUserId) {
            return res.status(401).json({ message: "Unauthorized to delete this post" });
        }
        if (post.image) {
            const publicId = post.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }
        await Post.findByIdAndDelete(id);
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
};
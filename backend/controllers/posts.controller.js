import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";
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
    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
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
      return res
        .status(401)
        .json({ message: "Unauthorized to delete this post" });
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

export const commentOnPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const currentUserId = req.user._id.toString();
    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const newComment = { user: currentUserId, text };
    post.comments.push(newComment);
    await post.save();
    res.json({ message: "Comment added successfully", post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id.toString();
    const user = await User.findById(currentUserId);
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const isLiked = post.likes.includes(currentUserId);
    
    if (isLiked) {
      // Unlike the post
      await Post.updateOne({_id: id}, { $pull: { likes: currentUserId } });
      await User.updateOne({ _id: currentUserId }, { $pull: { likedPosts: id } });
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      // Like the post
      post.likes.push(currentUserId);
      await User.updateOne({ _id: currentUserId }, { $push: { likedPosts: id } });
      await post.save();
      // Send notification to the post owner
      const postOwner = await User.findById(post.user);
      if (postOwner._id.toString() !== currentUserId) {
        const notification = new Notification({
          from: currentUserId,
          to: postOwner._id,
          type: "like",
        });
        await notification.save();
      }
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    res.json({ counts: posts.length, posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (likedPosts.length === 0) { 
      return res.status(200).json([]);
    }
    res.status(200).json({ counts: likedPosts.length, likedPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();
    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const posts = await Post.find({ user: { $in: user.following } }) // get posts of the users that the current user is following
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (posts.length === 0) {
      console.log(posts);
      return res.status(200).json({posts: []});
    }
    
    res.status(200).json({ counts: posts.length, posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userPosts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (userPosts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json({ counts: userPosts.length, userPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
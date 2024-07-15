import express from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';
import { commentOnPost, createPost, deletePost, getLikedPosts, getPosts, likeUnlikePost } from '../controllers/posts.controller.js';

const router = express.Router();

router.get("/liked-posts/:id", protectRoute, getLikedPosts);
router.get("/get-posts", protectRoute, getPosts);
router.post("/create-post", protectRoute, createPost);
router.post("/like-post/:id", protectRoute, likeUnlikePost);
router.post("/comment-post/:id", protectRoute, commentOnPost);
router.delete("/delete-post/:id", protectRoute, deletePost);

export default router;
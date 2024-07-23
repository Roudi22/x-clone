import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: "Server Error" });
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
        }
        if (user.followers.includes(req.user._id)) {
            // Unfollow the user
            await user.updateOne({ $pull: { followers: req.user._id } });
            await req.user.updateOne({ $pull: { following: req.params.id } });
            res.status(200).json({ message: "Unfollowed successfully" });
        } else {
            await user.updateOne({ $push: { followers: req.user._id } });
            await req.user.updateOne({ $push: { following: req.params.id } });
            // send notification
            const newNotification = new Notification({
                from: req.user._id,
                to: req.params.id,
                type: "follow",
            });
            await newNotification.save();
            // TODO: return the id of the user as a response
            res.status(200).json({ message: "Followed successfully" });
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const users = await User.find({ _id: { $nin: [...currentUser.following, req.user._id] } }).select("-password").limit(5); // Get 5 users who are not followed by the current user
        res.status(200).json({ message: "Suggested users fetched successfully", users });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: "Server Error" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { username, email, fullName, currentPassword, newPassword, bio, link } = req.body;
        let { profileImg, coverImg } = req.body;
        const currentUserId = req.user._id;
        let user = await User.findById(currentUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if ((!currentPassword && newPassword) || (currentPassword && !newPassword)) {
            return res.status(400).json({ error: "Please enter your current and new password" });
        }
        if ( currentPassword && newPassword) {
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: "Current password is incorrect" });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password should be at least 6 characters long" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

        }
        if (profileImg) {
            if ( user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
           const uploadedResponse =  await cloudinary.uploader.upload(profileImg);
           profileImg = uploadedResponse.secure_url;
        }
        if (coverImg) {
            if ( user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }
        user.username = username || user.username;
        user.email = email || user.email;
        user.fullName = fullName || user.fullName;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();
        user.password = null;
        return res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: "Server Error" });
        
    }
};
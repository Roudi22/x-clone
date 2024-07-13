import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Profile fetched successfully" ,user });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: "Server Error" });
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ message: "You cannot follow/unfollow yourself" });
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
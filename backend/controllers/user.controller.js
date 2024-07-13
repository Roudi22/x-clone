import User from "../models/user.model.js";

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
            res.status(200).json({ message: "Followed successfully" });
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: "Server Error" });
    }
};
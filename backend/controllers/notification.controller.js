import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
      const notifications = await Notification.find({ to: req.user._id })
        .sort({ createdAt: -1 })
        .populate({ path: "from", select: "username profilePicture" });
        if (notifications.length === 0) {
            return res.status(200).json([]);
            }
            await Notification.updateMany({ to: req.user._id }, { read: true });
            res.status(200).json( notifications);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Internal server error" });
        }
};

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.deleteMany({ to: userId });
        res.status(200).json({ message: "Notifications deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
        
    }
};
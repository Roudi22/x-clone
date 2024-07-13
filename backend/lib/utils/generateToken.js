import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const generateTokenAndSetCookie = (id, res) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const cookieOptions = {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        httpOnly: true, // The cookie cannot be accessed by client-side scripts
        sameSite: "strict", // The cookie is sent only to the same site as the one that originated the request
        secure: process.env.NODE_ENV !== "development", // The cookie is sent only via HTTPS
    };
    res.cookie("jwt", token, cookieOptions);
};
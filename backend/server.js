import express from 'express';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import postsRoutes from './routes/posts.routes.js';
import notificationRoutes from './routes/notification.routes.js';

import { v2 as cloudinary } from 'cloudinary';
import { connectMongoDB } from './db/connectMongoDB.js';

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(express.json({limit:"5mb"})); // to parse request body
app.use(express.urlencoded({ extended: true })); // to parse form data
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/notifications", notificationRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/dist')));
  app.get('*', (req, res) => { res.sendFile (path.resolve(__dirname, 'frontend', 'dist', 'index.html')) });
}
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
    connectMongoDB();
});
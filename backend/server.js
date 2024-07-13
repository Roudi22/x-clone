import express from 'express';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';

import { connectMongoDB } from './db/connectMongoDB.js';

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json()); // to parse request body
app.use(express.urlencoded({ extended: true })); // to parse form data
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
    connectMongoDB();
});
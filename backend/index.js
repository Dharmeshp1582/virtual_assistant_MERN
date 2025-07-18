import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/database.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

import cors from "cors";
import userRouter from "./routes/user.route.js";
import geminiResponse from "./gemini.js";


const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "https://virtualassistant-5m88.onrender.com",  // fixed from url to origin
  credentials: true                // include this if you're using cookies with frontend
}));

const port = process.env.PORT || 5000;

// Hi check route
// app.get('/', (req, res) => {
//   res.send("hi");
// });

// Auth route
app.use('/api/auth', authRouter);
app.use('/api/user',userRouter);//for user


// only for testing gemini response
// app.get('/', async (req, res) => {
//   let prompt = req.query.prompt ;
//   let data = await geminiResponse(prompt)
//   res.json(data); 
// }
// )

// Start server after DB connects
app.listen(port, async () => {
  await connectDB(); // ensure DB connection before server starts handling requests
  console.log(`Server started at port ${port}`);
});

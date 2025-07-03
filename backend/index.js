import express from "express";
import dotenv from "dotenv"
import connectDB from "./config/database.js";
dotenv.config();
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(cors())

const port = process.env.PORT || 5000

app.get('/',(req,res)=> {
  res.send("hii");
})


//auth route
app.use('/api/auth',authRouter);

app.listen(port,()=>{
  connectDB()
  console.log(`server started at ${port}`);
})
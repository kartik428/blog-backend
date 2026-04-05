import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import blogRoute from "./routes/blog.route.js";


const app = express()


// default Middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

// Routes
app.use("/api/v1/users", userRoute);
app.use("/api/v1/blog", blogRoute);

const PORT = process.env.PORT || 3000

"https://your-backend.onrender.com/api/v1/users/register"

app.listen(PORT, () => {
    connectDB()
  console.log(`Server is running on port ${PORT}`)
})


export default app;
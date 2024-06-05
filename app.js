import express from "express";
import { config } from "dotenv";
import connectDb from "./data.js";
import userRoute from "./routes/UserRoutes.js";
import ErrorMiddleware from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

//Using dotenv
config({ path: "./config.env" });
// connecting mongo
connectDb();
const app = express();
//using some middlewares 
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

//using cors
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true,
    methods:["GET","POST","PUT","DELETE"]
}))

//define router
app.use("/api/v1",userRoute)

export default app; 
app.use(ErrorMiddleware)
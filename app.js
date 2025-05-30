import express from 'express';
import cors from "cors";
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import authRouter from './Routes/AuthRoutes.js'
import connectDB from './Config/MongoDB.js';

const app=express();

const PORT = process.env.PORT || 3000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));

app.get('/',(req,res)=>{
    res.send('Hey team')
});



 app.use('/api/auth',authRouter);

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`)
});
import express from 'express';
import router from './Routes/UserRoutes.js'

const app=express();

const PORT = process.env.PORT || 3000;

//define a simple route

app.get('/',(req,res)=>{
    res.send('Hello, World')
});

app.use(router)

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`)
});
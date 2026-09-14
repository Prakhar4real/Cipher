import express from "express";
import dotenv from "dotenv";

//Load variables from .env into process.env
dotenv.config();

const app= express();

//Middleware that allows express to understand JSON request bodies;
app.use(express.json());

//basic test route
app.get("/", (req, res)=>{
    res.json({
        message: "Cipher API is running"
    });
});

const PORT= process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Cipher server running on port ${PORT}`);
});
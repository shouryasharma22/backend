import "./env.js"
import {connectDB }from "../db/index.js"
import express from "express"
import {app} from "./app.js"
connectDB().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
}).catch((err)=>{
    console.log("Error connecting to the database", err)
})
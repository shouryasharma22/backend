import mongoose from "mongoose"
import { DB_NAME } from "../src/constants.js"

export const connectDB = async () => {
    try {
        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`MONGODB CONNECTION SUCCESSFULL:${connectionInstance.connection.host}`)

    } catch (error) {
        console.error("MONGODB CONNECTION FAILED",error)
        process.exit(1)
    }
}
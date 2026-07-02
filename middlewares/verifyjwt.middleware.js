import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/users.model.js"

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ", "")
        if (!token) throw new ApiError(401, "Unauthorized")

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        if (!user) throw new ApiError(401, "Invalid token")

        req.user = user
        next()
    } catch (error) {
        next(new ApiError(401, error?.message || "Unauthorized"))
    }
}

export { verifyJWT }
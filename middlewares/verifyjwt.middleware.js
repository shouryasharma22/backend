const verifyJWT = async (req, res, next) => {
    try {
        const token=req.cookies?.jwt||req.headers?.["Authorization"]?.replace("Bearer ","")
        if(!token) throw new ApiError(401,"Unauthorized")
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user= await User.findById(decodedToken._id).select("-password -refreshToken")
            if(!user) throw new ApiError(401,"Invalid token")
            req.user=user
            next()
    } catch (error) {
        throw new ApiError(401,error?.message||"Unauthorized")
    }
    }

export { verifyJWT }
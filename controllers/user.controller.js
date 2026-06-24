import { asyncHandler } from "../utils/async.js";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {upload} from "../middlewares/multer.middleware.js"
const registerUser= asyncHandler(

        async (req,res)=>{
            console.log("--- DEBUG START ---");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    console.log("-------------------");
            const {fullName, email, password, username}=req.body

            console.log("Request body:", email);

            if([fullName, email, password, username].some((field)=>field?.trim()==="")){
                throw new ApiError(400,"All fields are required")
            }

            const existingUser=await User.findOne({
                $or : [ {username}, {email} ]
            })

            if(existingUser){
                throw new ApiError(409,"User with this email or username already exists")
            }

            const avatarLocalPath=req.files?.avatar?.[0].path
            const coverimageLocalPath=req.files?.coverImage?.[0].path

            if(!avatarLocalPath){
                throw new ApiError(400,"Avatar is required")
            }

        const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
        const avatarurl = avatarResponse?.url;

        const coverImageResponse = coverimageLocalPath ? await uploadOnCloudinary(coverimageLocalPath) : null;
        const coverImageUrl = coverImageResponse?.url || "";

        if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
}

            const user= await User.create({
                fullName,
                email,
                password,
                username,
                avatar:avatarurl,
                coverImage:coverImageUrl
            })

            const createdUser=await User.findById(user._id).select("-password -refreshToken")

            if(!createdUser){
                throw new ApiError(500,"User registration failed")
            }

            return res.status(201).json(
                new ApiResponse(201,"User registered successfully", createdUser)
            )


            


        }
    )

export {registerUser}
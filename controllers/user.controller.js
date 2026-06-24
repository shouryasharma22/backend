import { asyncHandler } from "../utils/async.js";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
const registerUser = asyncHandler(

    async (req, res) => {

        const { fullName, email, password, username } = req.body


        if ([fullName, email, password, username].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required")
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (existingUser) {
            throw new ApiError(409, "User with this email or username already exists")
        }
         console.log(req.files)

        const avatarLocalPath = req.files?.avatar?.[0].path
        console.log("Avatar path:", avatarLocalPath)
        const coverimageLocalPath = req.files?.coverImage?.[0].path

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required")
        }

        const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
        const avatarurl = avatarResponse?.url;

        const coverImageResponse = coverimageLocalPath ? await uploadOnCloudinary(coverimageLocalPath) : null;
        const coverImageUrl = coverImageResponse?.url || undefined;


        const user = await User.create({
            fullName,
            email,
            password,
            username,
            avatar: avatarurl,
            coverImage: coverImageUrl
        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken")

        if (!createdUser) {
            throw new ApiError(500, "User registration failed")
        }

        return res.status(201).json(
            new ApiResponse(201, "User registered successfully", createdUser)
        )





    }
)

export { registerUser }
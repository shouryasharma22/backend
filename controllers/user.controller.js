import { asyncHandler } from "../utils/async.js";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { verifyJWT } from "../middlewares/verifyjwt.middleware.js";

const generateRefreshAndAccessTokens = async function (userId) {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();
        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating token")
    }
}

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
const loginUser = asyncHandler(async (req, res) => {
    //req.body->data
    //username email etc...
    //if it is in db
    //password check
    //generate and give access and refresh token
    //send these tokens in cookies
    const { username, email, password } = req.body
    if (!(username || email)) {
        throw new ApiError(400, "Please enter username or email")
    }
    const user = await User.findOne({ $or: [{ username }, { email }] })
    if (!user) throw new ApiError(404, "User doesnt exist")

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) throw new ApiError(401, "Incorrect Password")

    const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(
            200,
            "Generated logged in successfully",
            { user: loggedInUser, refreshToken, accessToken }
        ))
})
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: null } },
        { new: true }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    res.clearCookie("refreshToken", options)
    res.clearCookie("accessToken", options)
    return res.status(200).json(new ApiResponse(200, "Logged out successfully",{}))
})

//when access tokens expires, we can use refresh token to generate new access token
//get the refresh token,  verify it with the one in the db, if valid, generate new access token and send it back to the user

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.headers?.authorization?.replace("Bearer ", "")
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized")

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken._id)
    if (!user || user.refreshToken !== incomingRefreshToken) throw new ApiError(401, "Invalid refresh token")

    const {accessToken , refreshToken} = await user.generateRefreshAndAccessTokens()
    return res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(new ApiResponse(200, "Access token refreshed successfully", { accessToken }))
})

export { registerUser, loginUser, logoutUser, refreshAccessToken }
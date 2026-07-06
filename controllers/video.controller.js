import { asyncHandler } from "../utils/async.js";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // 1. Verify the video ID is provided
    if (!videoId || videoId.trim() === "") {
        throw new ApiError(400, "Video ID is required");
    }

    // 2. Fetch the video details from the database
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 3. SECURE HISTORY UPDATE (Option A)
    // Run your $pull and $push operations automatically
    if (req.user?._id) {
        // Remove old entry if it exists
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { watchHistory: videoId }
        });
        
        // Push it to the end so it becomes the latest watched video
        await User.findByIdAndUpdate(req.user._id, {
            $push: { watchHistory: videoId }
        });
    }

    // 4. Return the video payload normally to the frontend
    return res
        .status(200)
        .json(new ApiResponse(200, "Video data retrieved successfully", video));
});

export { getVideoById };
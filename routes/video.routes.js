import {Router} from "express"
import { getVideoById } from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router=Router()
router.route("/v/:videoId").get(verifyJWT, getVideoById)

export default router
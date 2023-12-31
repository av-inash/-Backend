import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelprofile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    generateAndSendOtp,
    verifyOtpAndUpdatePassword



} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { verify } from "jsonwebtoken";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 1

        }

    ]),
    registerUser
)
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("/coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelprofile)

router.route("/history").get(verifyJWT, getWatchHistory)


// New routes for forgot password
router.route("/forgot-password").post(generateAndSendOtp);
router.route("/reset-password").post(verifyOtpAndUpdatePassword);




export default router;

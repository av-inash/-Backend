import { ApiError } from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {uploadOnCoudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessAndRefereshToken=async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken =user.generateAccessToken()
        const refreshtoken =user.generateRefreshToken()

        user.refreshtoken=refreshtoken
        await user.save({ validateBeforeSave:false })


        return {accessToken,refreshtoken}


    }catch{
        throw new ApiError(500,"Something went wrong while generating refresh and access Token")
    }
}


const registerUser =asyncHandler(async(req,res)=>{
    //get user details from frontend
    //validation-not empty
    //check if user already exits: username,email
    //check for images,check for avatar
    //upload them to cloudanary
    //create  user object -create entry in Db
    //remove password and refresh tokenn field from response
    //check for user creation
    //return res

    const{fullName,email,username,password}=req.body
    // console.log("email",email)
    // if(fullName==""){
    //     throw new ApiError(400,"fullName is required")
    // }                                                   aise ek ek kr k field check nhi krna agr jada fiel hai toh

    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }


   const existedUser= await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }


    const avatarLocalPath= req.files?.avatar[0]?.path;
    // const coverImageLocalPath= req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath=req.files.coverImage[0].path
    }


    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar =await uploadOnCoudinary(avatarLocalPath)
    const coverImage=await uploadOnCoudinary(coverImageLocalPath)

    if(avatar){
        throw new ApiError(400,"Avatar field is required ")
    }

    const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",    // cover image ka chek to lgaye nahi toh yaha dhyan rakhna hai uska agr hai toh le lo warna empty rehne do
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"        // yaha wo likhna hai jo hme nahi chahiye

    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered succesfully")
    )

 
})

const loginUser=asyncHandler(async (req,res)=>{
    //req body-> data
    //check username or email 
    // find the user
    // password check
    //access and refresh token
    //send  cookie


    const {email,username,password}=req.body
    if(!(username || email)){
        throw new ApiError(400,"username or email is required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user Credentials")
    }

    const{accessToken,refreshToken}=await generateAccessAndRefereshToken(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,           //then these cookie only modified by server only
        secure:true

    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,                                    //status code
            {
                user:loggedInUser,accessToken,refreshToken                   //data
            },
            "User logged In successfully"                   //message
            )
    )



})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{refreshToken:undefined}
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out Successfullly"))




})

export {registerUser,loginUser,logoutUser}
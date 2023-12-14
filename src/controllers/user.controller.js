import { ApiError } from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {uploadOnCoudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


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
    console.log("email",email)
    // if(fullName==""){
    //     throw new ApiError(400,"fullName is required")
    // }                                                   aise ek ek kr k field check nhi krna agr jada fiel hai toh

    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }


   const existedUser= User.findOne({
        $or:[{usename},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }


    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;


    if(avatarLocalPath){
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

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"        // yaha wo likhna hai jo hme nahi chahiye

    )
    if(createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user Registered succesfully")
    )

 
})

export {registerUser}
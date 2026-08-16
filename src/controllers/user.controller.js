import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists - username, email
  // check for images, avatar
  // upload them to cloudinary-avatar
  // create user object , entry in database
  // remove password and refresh token fields from response
  // check for user creation
  // return response

  const { username, email, fullName, password } = req.body;
  if (!username || !email || !fullName || !password)
    throw new ApiError(400, "some fields are missing ");

  const isUserExisted = await User.findOne({ $or: [{ username }, { email }] });
  if (isUserExisted)
    throw new ApiError(409, "user with email or username is already existed ");

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) throw new ApiError(409, "avatar is required ");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) throw new ApiError(500, "avatar is missing ");
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // learn more about select method
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser)
    throw new ApiError(500, "something went wrong while registering the user ");

  return res
    .status(201)
    .json(new ApiResponse(200, "user created successfully ", createdUser));
});

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const refreshToken = user.generateAccessToken();
    const accessToken = user.generateAccessToken();
    user.refreshToken = refreshToken;
    await user.save({ validationBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (err) {
    console.error(
      "error occurred while generating the access and refresh token "
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  // get credentials from user
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookie

  const { username, email, password } = req.body;
  if (!username || !email)
    throw new ApiError(400, "username and email are required ");
  const user = await User.findOne({ $or: [{ email, username }] });
  if (!user)
    throw new ApiError(404, "user with this email or username doesn't exist");
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "invalid credentials ");

  const { refreshToken, accessToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(new ApiResponse(200, "login successfully", loggedInUser));
});

const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
  };
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new new ApiResponse(200, {}, "logout successfully ")());
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookie?.refreshToken || req.body?.refreshToken;
  if (!token) throw new ApiError(401, "invalid credentials ");
  const decodedToken = await jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decodedToken?.user_id);
  if (!user) throw new ApiError(401, " invalid credentials ");

  if (token !== user.refreshToken)
    throw new ApiError(401, "token is invalid or expire ");

  const { refreshToken, newAccessToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", newAccessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {}, "token refreshed successfully "));
});

export { registerUser, loginUser, logoutUser };

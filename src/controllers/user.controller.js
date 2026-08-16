import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

export { registerUser };

const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const UserModel = require("../model/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// ************************************************************
const checkAuthentication = catchAsync(async (req, res, next) => {
  let userInfo = {};

  
  // 1.) check if user is authenticated
  // 1.1) check if jwt is present
  const token = req.headers.authorization?.split(" ")[1];


  if (!token) {
    return next(new AppError("Please Login", 403)); //403 status code is returned when the server understands the request, but the client does not have the necessary permissions to access the requested resource.
  }

  // 1.2) check if jwt is correct
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    userInfo = decoded;
  } catch (err) {
    return next(new AppError("Please Login", 403));
    //403 status code is returned when the server understands the request, but the client does not have the necessary permissions to access the requested resource.
  }

  // 1.3) check if user exist
  const user = await UserModel.findById(userInfo.id);

  if (!user) {
    return next(new AppError("User not exists any more!", 403));  //403 status code is returned when the server understands the request, but the client does not have the necessary permissions to access the requested resource.
  }

  req.currentUser = user;
  next();
});

module.exports = checkAuthentication;

const jwt = require("jsonwebtoken");
const UserModal = require("../model/userModel");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// *****************************************

const update = catchAsync(async (req, res, next) => {
  // 1.) check if the inputs are valid and filter out only updatable fields and update the user

  const filteredObj = {};
  console.log(req.body);

  const updatableFieldsArray = ["firstName", "lastName", "email", "imageUrl"];

  Object.keys(req.body).forEach((field) => {
    if (updatableFieldsArray.includes(field)) {
      filteredObj[field] = req.body[field];
    }
  });

  const response = await UserModal.findByIdAndUpdate(
    req.currentUser._id,
    filteredObj,
    {
      new: true,
      runValidators: true,
    }
  );

  // 3.) send response
  // res.type("json");
  res.status(200).json({
    //200 status code is a positive acknowledgment from the server, indicating that the request was successful
    status: "success",
    user: response,
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  // 1.) delete the user

  await UserModal.findByIdAndDelete(req.currentUser._id);

  // 2.) Send response
  res.status(204).send(); //204 stands for "No Content." It indicates that the server has successfully processed the request, but there is no additional content to send in the response.
});

const updatePassword = catchAsync(async (req, res, next) => {
  //  1.) verify the old password and update password

  const { oldPassword, password, passwordConfirm } = req.body;

  if (!oldPassword || !password || !passwordConfirm) {
    return next(new AppError("Please enter all the fields", 400)); //400 Bad Request response is given when the server cannot process the client's request due to errors in the request itself
  }
  const user = await UserModal.findById(req.currentUser._id).select(
    "+password"
  );

  const isVerfied = await bcrypt.compare(oldPassword, user.password);

  if (!isVerfied) {
    return next(new AppError("Entered Password in incorrect", 400)); //400 Bad Request response is given when the server cannot process the client's request due to errors in the request itself
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  res.status(200).json({
    //200 status code is a positive acknowledgment from the server, indicating that the request was successful
    status: "success",
    message: "Password is updated successfully",
  });
});

const checkAccess = catchAsync(async (req, res, next) => {
  const { refreshToken, ...response } = req.currentUser;

  res.status(200).json({
    //200 status code is a positive acknowledgment from the server, indicating that the request was successful
    status: "success",
    data: req.currentUser,
  });
});

const getUserData = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const user = await UserModal.findById(id);

  res.status(200).send({
    status: "success",
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      email: user.email,
    },
  });
});

exports.udpate = update;
exports.checkAccess = checkAccess;
exports.deleteUser = deleteUser;
exports.updatePassword = updatePassword;
exports.getUserData = getUserData;

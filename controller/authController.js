const UserModal = require("../model/userModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const { promisify } = require("util");

// ******************************************

const signup = catchAsync(async (req, res, next) => {
  // 1.) Create the user

  await UserModal.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role || "user",
  });

  // 2.) send response

  res.status(201).json({
    status: "success",
    message: "User is successfully signed up",
  });
});

// LOGIN USER

const login = catchAsync(async (req, res, next) => {
  //1.) check if the email and password is present

  const email = req.body.email;
  const pass = req.body.password;
  console.log(email);

  if (!email || !pass) {
    return next(new AppError("Please enter the mail and password", 400));
  }

  //2.) check if the user with the mail id exist

  const user = await UserModal.findOne({ email: email }).select("+password");
  if (!user) {
    return next(new AppError("email or password is incorrect", 400));
  }

  console.log(user);

  // 3.) check if the password is correct
  const isCorrect = await bcrypt.compare(pass, user.password);
  console.log(isCorrect);

  if (!isCorrect) {
    return next(new AppError("email or password is incorrect", 400));
  }

  // 4.) generate the JWT
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
  console.log(token);

  // 5.) generate a refresh token
  const refreshTokenGenerate = jwt.sign(
    { email: user.email },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  console.log(refreshTokenGenerate);

  // 6.) save refresh token with the current user

  const result = await UserModal.findOneAndUpdate(
    { email: email },
    {
      $set: { refreshToken: refreshTokenGenerate },
    },
    { upsert: true, new: true }
  );
  console.log(result);

  // 6.) Creates a secure cookie with the refresh token

  res.cookie("jwt", refreshTokenGenerate, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000,
  });

  // 5.) Send the response along with the JWT

  const { password, refreshToken, ...responseData } = result._doc;

  setTimeout(() => {
    res.status(200).json({
      status: "success",
      data: {
        token: token,
        user: responseData,
      },
    });
  }, 5000);
});

// LOGOUT USER

const logout = async (req, res, next) => {
  // console.log(req.currentUser);
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return next(new AppError("User is not logged in", 401));
  }

  const refreshToken = cookies.jwt;

  try {
    await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );
  } catch (err) {
    return next(new AppError(err.message, 401)); //In the case of "401 Unauthorized," it means that the server has received the request, but it requires authentication, and the client (the user or the system making the request) hasn't provided valid credentials or hasn't authenticated itself properly.
  }

  const user = await UserModal.findOne({ refreshToken: refreshToken });

  if (!user) {
    return next(new AppError("User is not logged in", 401)); //In the case of "401 Unauthorized," it means that the server has received the request, but it requires authentication, and the client (the user or the system making the request) hasn't provided valid credentials or hasn't authenticated itself properly.
  }

  const doc = await UserModal.findByIdAndUpdate(
    user._id,
    {
      $unset: {
        refreshToken: "",
      },
    },
    { new: true }
  );

  console.log(doc);

  // To delete the cookie on client side
  res.cookie("jwt", "", { maxAge: 0 });

  res.status(200).send({
    status: "success",
    message: "User is successfully logged out",
  });
};

const handleRefreshToken = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  console.log(cookies);
  if (!cookies?.jwt) {
    return next(new AppError("Please Login", 401));
  }

  const refreshJwtToken = cookies.jwt;

  jwt.verify(
    refreshJwtToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        return next(new AppError(err.message, 403));
      }
    }
  );

  const foundUser = await UserModal.findOne({ refreshToken: refreshJwtToken });
  if (!foundUser) {
    return next(new AppError("User not exists any more!", 404));
  }

  const accessToken = jwt.sign(
    {
      id: foundUser._id,
      email: foundUser.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const { refreshToken, ...response } = foundUser._doc;

  res.status(200).json({
    status: "success",
    accessToken: accessToken,
    data: {
      user: response,
    },
  });
});

const checkLogin = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  console.log(cookies);
  if (!cookies?.jwt) {
    return next(new AppError("Please Login", 401));
  }

  const refreshJwtToken = cookies.jwt;

  jwt.verify(
    refreshJwtToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        return next(new AppError(err.message, 403));
      }
    }
  );

  const foundUser = await UserModal.findOne({ refreshToken: refreshJwtToken });
  if (!foundUser) {
    return next(new AppError("User not exists any more!", 404));
  }
  res.status(200).json({
    status: "success",
    message: "User is Logged in",
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1.) Get user based on posted email
  const email = req.body.email;

  const user = await UserModal.findOne({ email: email });
  console.log(user);

  if (!user) {
    return next(new AppError("There is no user with that email! ", 404)); // commonly known as "Not Found," is a standard response code indicating that the server did not find the requested resource
  }

  // 2.) Generate a random token

  const resetToken = user.createPasswordResetToken();

  const updated = await user.save({ validateBeforeSave: false });
  console.log(updated);

  // 3.) send it to user's email
  const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

  const message = `Click on the link below to reset your password. Valid for 10 mins\n ${resetURL}`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Password reset",
      message: message,
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("Error in sending the mail, Try again later!", 500)
    );
  }

  res.status(200).json({
    status: "Success",
    message: "Email sent for reseting the password",
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1.) get user based on the token

  const token = req.params.resetToken;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserModal.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  console.log(user);

  // 2.) if token has not expired and there is a user , set the user password

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400)); // "400" typically refers to the HTTP status code "Bad Request." This code is returned by a server when the client's request cannot be processed due to a client error
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;

  // 3.) reset the resetToken

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 4.) send response

  res.status(200).json({
    status: "success",
    message: "Password resetted successfully",
  });
});

exports.signup = signup;
exports.login = login;
exports.handleRefreshToken = handleRefreshToken;
exports.logout = logout;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.checkLogin = checkLogin;

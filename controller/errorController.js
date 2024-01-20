const AppError = require("../utils/appError");

const errorHandler = (err, req, res, next) => {
  // console.log(err);
  let error = { message:err.message,...err };
  console.log(error);

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  // Handling Mongoose errors, because they are not marked as operational errors

  if (error.code === 11000) {
    const message = `User with this: ${Object.keys(error.keyValue).join(
      ", "
    )}. Is already registered with us, Please use another value`;

    error = new AppError(message, 400);
  }

  if (error._message === "Users validation failed") {
    const errors = Object.values(err.errors).map((errorObj) => {
      return errorObj.message;
    });

    const message = `Invalid input data. ${errors.join(". ")}`;
    error = new AppError(message, 400);   //400 Bad Request response is given when the server cannot process the client's request due to errors in the request itself
  }

  // Operational , trusted errors
  if (error.isOperational) {
    console.log(error.message);
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }
  // Programming or unknown error
  else {
    // 1.) Log error
    console.error("ERROR 💣");
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

module.exports = errorHandler;

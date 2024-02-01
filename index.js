const express = require("express");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRoutes");
const propertyRouter = require("./routes/propertyRoutes");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");
const cookieParser = require("cookie-parser");


// ********************************************

const app = express();

const corsOptions ={
  origin:['http://localhost:5173',"https://main--celadon-croissant-c99bf1.netlify.app"], 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}

app.use(cors(corsOptions));
app.use(
  rateLimit({
    windowMs: 1 * 60 * 60 * 1000,
    max: 1000,
    message: "You have exceeded the limit",
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// middleware for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

app.use("/api/v1/user/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/property",propertyRouter)

app.all("*", (req, res, next) => {
  // res.status(404).send({
  //   status: "error",
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);

  next(err);
});

app.use(globalErrorHandler);

module.exports = app;

// Sync errors handler
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION!🐶 Shutting down...📉 ");
  console.log(err.name, err.message);
  process.exit(1);
});


const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./index");

// ************************************************



// Configuring the .env file to get access to it
dotenv.config({
  path: "./config.env",
});

// Connecting to Database

const DB_URL = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB_URL).then(() => {
  console.log("Connected to DB Successfully");
});

// Starting the server
const server = app.listen(process.env.PORT, () => {
  console.log("server started at 3000");
});

// Async errors handler
// Handling all unhandled Rejections here, including the mongodb error if its not able to connect
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION!🐧 Shutting down...📉 ");
  console.log(err.name, err.message);

  // Shutting down server gracefully so that server completes all the pending requests then it shuttdowns.
  server.close(() => {
    // shutting down the server
    process.exit(1);
  });
});



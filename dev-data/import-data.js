const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const PropertyModel = require("../model/propertyModel");

dotenv.config({ path: "../config.env" });

const DB_URL = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB_URL).then(() => {
  console.log("Connected to DB Successfully");
});

// Reading file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/property.json`, "utf-8"));

// Import data to DB
const importData = async () => {
  try {
    await PropertyModel.create(tours);
    console.log("Data is successfully loaded");
    process.exit(1);
  } catch (err) {
    console.log(err);
  }
};

// Delete all data from collection
const deleteData = async () => {
  try {
    await PropertyModel.deleteMany();
    console.log("data successfully deleted");

    process.exit(1);
  } catch (err) {
    console.log(err);
  }
};

if(process.argv[2] === '--import'){
  importData();
}else if(process.argv[2] === '--delete'){
  deleteData();
}
console.log(process.argv);
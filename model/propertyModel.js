const mongoose = require("mongoose");

// **********************************************

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter name of your property"],
  },

  description: {
    type: String,
    required: [true, "Please enter description for your property"],
    minLength: [10, "Description is too small"],
  },

  price: {
    type: Number,
    required: [true, "Please enter a price"],
  },
  area: {
    type: Number,
    required: [true, "Please enter area"],
  },

  location: {
    type: String,
    required: [true, "Please enter location"],
  },

  bedrooms: {
    type: Number,
  },

  bathrooms: {
    type: Number,
  },

  parking: {
    type: Boolean,
  },

  furnished: {
    type: Boolean,
  },
  gym: {
    type: Boolean,
  },
  swimmingPool: {
    type: Boolean,
  },
  kitchens: {
    type: Number,
  },
  security: {
    type: Boolean,
  },
  garden: {
    type: Boolean,
  },
  images:{
type:[]
  },

  creator: {
    type: String,
    required: [true, "Please login"],
  },
});

const PropertyModal = mongoose.model("Propertie", propertySchema);

module.exports = PropertyModal;

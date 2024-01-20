const PropertyModal = require("../model/propertyModel");
const UserModel = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");

const newProperty = async (req, res, next) => {
  try {
    console.log(req.body);
    console.log(req.currentUser.email);

    const {
      name,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      kitchens,
      parking,
      furnished,
      swimmingPool,
      gym,
      security,
      garden,
      images,
      area,
    } = req.body;

    await PropertyModal.create({
      name,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      parking,
      furnished,
      garden,
      security,
      gym,
      swimmingPool,
      kitchens,
      images,
      area,
      creator: req.currentUser.email,
    });

    res.status(200).json({
      status: "success",
      message: "Created the property successfully",
    });
  } catch (err) {
    console.log(err);
  }
};

const getAllProperties = catchAsync(async (req, res, next) => {
  // 1.) BUILD query
  const queryObj = { ...req.query };
  const { sortOrder, sortBy } = req.query;
  console.log(req.query);

  // 2.) Filtering
  const excludedParams = ["page", "sortBy", "limit", "fields", "sortOrder"];
  excludedParams.forEach((el) => delete queryObj[el]);

  // 3.) Advanced Filtering

  // {bedrooms:{$gte:5}} // desired object
  // { bedrooms: { gte: '1' } } //what we are getting

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  console.log(queryStr);

  queryStr = JSON.parse(queryStr);

  let query = PropertyModal.find(queryStr);

  // Sorting
  const sortingOrder = sortOrder || "asc";
  const orderBy = sortBy || "price";

  console.log(sortingOrder, orderBy);

  const sortOptions = {};

  sortOptions[orderBy] = sortingOrder;
  console.log(sortOptions);

  query = query.sort(sortOptions);

  // PAGINATION

  const { limit, page } = req.query;

  const theLimit = limit || 10;
  let thePage = page || 1;

  const skip = (page - 1) * limit;

  query = query.limit(theLimit).skip(skip);

  //4.) Execute Query
  const properties = await query;

  // 5.) Get Total Properties
  const totalProperties = await PropertyModal.find();

  // 5.) Send Response

    res.status(200).json({
      status: "success",
      page: thePage,
      length: properties.length,
      total: totalProperties.length,
      properties,
    });

});

const getProperty = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const property = await PropertyModal.findById(id);

  res.status(200).json({
    status: "success",
    property,
  });
});

const getUserProperties = async (req, res, next) => {
  try {
    //1.) Extract the email id
    const email = req.currentUser.email;

    // 2.) query the properties with that email from all

    const userProperties = await PropertyModal.find({ creator: email });

    console.log(userProperties);

    // 3.) send the response

    res.status(200).json({
      message: "success",
      data: userProperties,
    });
  } catch (err) {
    console.log(err);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const id = req.params.id;

    const updatableFields = [
      "name",
      "description",
      "price",
      "location",
      "beds",
      "bathrooms",
      "parking",
      "furnished",
    ];

    const filteredObject = {};

    Object.keys(req.body).forEach((key) => {
      if (updatableFields.includes(key)) {
        filteredObject[key] = req.body[key];
      }
    });

    const updatedProperty = await PropertyModal.findByIdAndUpdate(
      id,
      filteredObject,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      property: updatedProperty,
    });
  } catch (err) {
    console.log(err);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    await PropertyModal.deleteOne({ _id: id });

    res.status(204).send();
  } catch (err) {
    console.log(err);
  }
};

exports.newProperty = newProperty;
exports.getAllProperties = getAllProperties;
exports.getUserProperties = getUserProperties;
exports.updateProperty = updateProperty;
exports.deleteProperty = deleteProperty;
exports.getProperty = getProperty;

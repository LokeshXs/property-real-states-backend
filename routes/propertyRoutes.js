const express = require("express");
const propertyController = require("../controller/propertyController");
const checkAuthentication = require("../middleware/checkAuthentication");
// *************************************

const router = express.Router();

router.post(
  "/new-property",
  checkAuthentication,
  propertyController.newProperty
);


router.get("/all", propertyController.getAllProperties);
router.get("/:id",propertyController.getProperty);

router.get("/user-properties",checkAuthentication,propertyController.getUserProperties);

router.patch("/update/:id",checkAuthentication, propertyController.updateProperty);

router.delete("/delete/:id",checkAuthentication, propertyController.deleteProperty);

module.exports = router;

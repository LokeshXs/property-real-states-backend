const express = require("express");
const userController = require("../controller/userController");
const checkAuthentication = require("../middleware/checkAuthentication");

// ***************************************

const router = express.Router();

router.post("/update", checkAuthentication, userController.udpate);
router.delete("/delete", checkAuthentication, userController.deleteUser);
router.post(
  "/updatePassword",
  checkAuthentication,
  userController.updatePassword
);
// router.get("/check-access", checkAuthentication, userController.checkAccess);
router.get("/userdata/:id",checkAuthentication, userController.getUserData);

module.exports = router;

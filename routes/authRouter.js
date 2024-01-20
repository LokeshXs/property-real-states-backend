const express = require("express");
const authController = require("../controller/authController");
// **************************************
const router = express.Router();

router.post("/signup",authController.signup);
router.post("/signin",authController.login);
router.get("/refresh", authController.handleRefreshToken);
router.get("/check-login",authController.checkLogin);
router.get("/logout", authController.logout);

router.post("/forgot-password",authController.forgotPassword);
router.patch("/reset-password/:resetToken",authController.resetPassword);


module.exports = router;
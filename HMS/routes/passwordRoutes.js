const express = require("express");
const router = express.Router();

const password = require("../controller/password");

//Forgot Password page
router
  .route("/forgot")
  .get(password.renderForgotPasswordPage)
  .post(password.sendResetLink);

//reset password route
router
  .route("/reset/:id/:token")
  .get(password.renderNewPasswordPageWithValidation)
  .post(password.changeNewPassword);

module.exports = router;

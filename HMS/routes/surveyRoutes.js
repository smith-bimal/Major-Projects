const express = require("express");
const {
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
} = require("../utils/middlewares");
const router = express.Router();

survey = require("../controller/survey");

router.get(
  "/",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  survey.rendedSurveyPage
);

module.exports = router;

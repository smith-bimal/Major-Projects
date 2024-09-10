const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  isAdminOrDoctor,
  isLoggedIn,
  isAuthenticated,
} = require("../utils/middlewares");

const profile = require("../controller/profile");


//Image uploading configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
}).single("avatar");

router
  .route("/")
  .get(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    profile.renderProfilePage
  )
  .patch(
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    upload,
    profile.updateProfile
  );

module.exports = router;

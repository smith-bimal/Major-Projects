const express = require("express");
const router = express.Router();
const path = require("path");

const multer = require("multer");
const {
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
} = require("../utils/middlewares");
const doctor = require("../controller/doctor");

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
  .route("/add")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    doctor.renderNewDoctorForm
  )
  .post(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    upload,
    doctor.createNewDoctor
  );

router
  .route("/q")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    doctor.renderDoctorListTable
  );

router.get(
  "/q/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  doctor.renderDoctorDetails
);

router.get(
  "/manage",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  doctor.renderDoctorManageTable
);

router
  .route("/manage/:id")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    doctor.renderDoctorUpdateForm
  )
  .patch(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    upload,
    doctor.updateDoctorDetails
  )
  .delete(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    doctor.deleteDoctorDetails
  );

module.exports = router;

const express = require("express");
const router = express.Router();
const path = require("path");

const {
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
} = require("../utils/middlewares");

const employee = require("../controller/employee");

const multer = require("multer");

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
    employee.renderAddEmployeeForm
  )
  .post(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    upload,
    employee.addNewEmployee
  );

router.get(
  "/q",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  employee.renderAllEmployeeListTable
);

router.get(
  "/q/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  employee.renderEmployeeDetails
);

router.get(
  "/manage",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  employee.renderEmployeeManageTable
);

router
  .route("/manage/:id")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    employee.renderEmployeeUpdateForm
  )
  .patch(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    upload,
    employee.updateEmployeeDetails
  )
  .delete(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    employee.deleteEmployeeDetails
  );

module.exports = router;

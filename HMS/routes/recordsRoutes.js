const express = require("express");
const router = express.Router();

const {
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
} = require("../utils/middlewares");
const record = require("../controller/records");

router.get(
  "/appointment",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  record.renderAppointmentRecordsTable
);

router.get(
  "/appointment/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  record.renderAppointmentRecordDetails
);

router.get(
  "/patient",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  record.renderPatientRecordsTable
);

router.get(
  "/patient/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  record.renderPatientRecordDetails
);

module.exports = router;

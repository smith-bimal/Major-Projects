const express = require("express");
const router = express.Router();

const {
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
} = require("../utils/middlewares");

const patient = require("../controller/patient");

router.get(
  "/vitals",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  patient.renderPatientVitalsTable
);

router
  .route("/vitals/:id")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    patient.renderVitalsUpdateForm
  )
  .patch(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    patient.updatePatientVitals
  );

router
  .route("/register")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    patient.renderPatientRegistrationForm
  )
  .post(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    patient.registerPatient
  );

router.get(
  "/q",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  patient.renderPatientTable
);

router.get(
  "/q/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  patient.renderPatientDetails
);

router.get(
  "/manage",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  patient.renderPatientManageTable
);

router
  .route("/manage/:id")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    patient.renderPatientUpdateForm
  )
  .patch(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    patient.updatePatientDetails
  )
  .delete(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    patient.deletePatient
  );

router.get(
  "/discharge",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  patient.renderDischargeTable
);

router
  .route("/discharge/:id")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    patient.renderDischargeForm
  )
  .post(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    patient.dischargePatient
  );

module.exports = router;

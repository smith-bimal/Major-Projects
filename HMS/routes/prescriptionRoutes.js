const express = require("express");
const router = express.Router();
const {
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
} = require("../utils/middlewares");
const prescription = require("../controller/prescription");

router.get(
  "/add",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  prescription.renderAddPrescriptionTable
);

router
  .route("/add/:id")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    prescription.renderNewPrescriptionForm
  )
  .post(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    prescription.createNewPrescription
  );

router.get(
  "/q",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  prescription.renderViewPrescriptionTable
);

router.get(
  "/q/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  prescription.renderPrescription
);

router.get(
  "/manage",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
 prescription.renderManagePrescriptionTable
);

router
  .route("/manage/:id")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    prescription.renderUpdatePrescriptionForm
  )
  .patch(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
   prescription.updatePrescription
  )
  .delete(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    prescription.deletePrescription
  );

module.exports = router;

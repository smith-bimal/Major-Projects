const express = require("express");
const router = express.Router();
const {
  isAuthenticated,
  isAdminOrDoctor,
  dynamicIsLoggedIn,
} = require("../utils/middlewares");
const pharmacy = require("../controller/pharmacy");

router
  .route("/add")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    pharmacy.renderPharmacyForm
  )
  .post(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    pharmacy.createNewPharmacy
  );

router.get(
  "/manage",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  pharmacy.renderManagePharmacyTable
);

router
  .route("/manage/:id")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    pharmacy.renderPharmacyUpdateForm
  )
  .patch(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    pharmacy.updatePharmacy
  )
  .delete(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    pharmacy.deletePharmacy
  );

module.exports = router;

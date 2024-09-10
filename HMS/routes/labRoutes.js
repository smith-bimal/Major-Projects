const express = require("express");
const router = express.Router();

const {dynamicIsLoggedIn,isAdminOrDoctor,isAuthenticated} = require("../utils/middlewares");

const lab = require("../controller/lab");

router.get(
  "/tests",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  lab.renderTestsTable
);

router
  .route("/tests/:id")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    lab.renderTestForm
  )
  .patch(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    lab.updateTests
  );

router.get(
  "/results",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  lab.renderResultsTable
);

router
  .route("/results/:id")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    lab.renderResultsForm
  )
  .patch(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    lab.updateResults
  );

router.get(
  "/reports",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  lab.renderReportsTable
);

router.get(
  "/reports/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  lab.renderLabReport
);

module.exports = router;

const express = require("express");
const router = express.Router();

const payroll = require("../controller/payroll");
const {
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
} = require("../utils/middlewares");

router.get(
  "/add",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  payroll.renderAddPayrollTable
);

router
  .route("/add/:id")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    payroll.renderAddPayrollForm
  )
  .post(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    payroll.addNewPayroll
  );

router.get(
  "/manage",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  payroll.renderManagePayrollTable
);

router
  .route("/manage/:id")
  .get(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    payroll.renderUpdateEmpPayrollForm
  )
  .patch(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    payroll.updateEmpPayroll
  )
  .delete(
    isAdminOrDoctor,
    dynamicIsLoggedIn,
    isAuthenticated,
    payroll.deleteEmpPayroll
  );

router.get(
  "/generate",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  payroll.renderGeneratePayrollTable
);

router.get(
  "/generate/:id",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  payroll.renderEmpFinalPayroll
);

module.exports = router;

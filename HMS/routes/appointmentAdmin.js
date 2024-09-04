const express = require("express");
const router = express.Router();
const {
    isAuthenticated,
  isAdminOrDoctor,
  isLoggedIn,
} = require("../utils/middlewares");
const appointment = require("../controller/appointment");

router
  .route("/create")
  .get(
    isAdminOrDoctor,
    isAuthenticated,
    isLoggedIn("admin"),
    appointment.renderAppointmentForm
  )
  .post(
    isAdminOrDoctor,
    isAuthenticated,
    isLoggedIn("admin"),
    appointment.createAppointment
  );

router.get(
  "/manage",
  isAdminOrDoctor,
  isAuthenticated,
  isLoggedIn("admin"),
  appointment.renderManageAppointmentsTable
);

router
  .route("/manage/:id")
  .get(
    isAdminOrDoctor,
    isAuthenticated,
    isLoggedIn("admin"),
    appointment.manageAppointment
  )
  .patch(
    isAdminOrDoctor,
    isAuthenticated,
    isLoggedIn("admin"),
    appointment.updateAppointment
  )
  .delete(
    isAdminOrDoctor,
    isAuthenticated,
    isLoggedIn("admin"),
    appointment.deleteAppointment
  );

module.exports = router;

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
    isLoggedIn("doctor"),
    appointment.renderAppointmentForm
  )
  .post(
    isAdminOrDoctor,
    isAuthenticated,
    isLoggedIn("doctor"),
    appointment.createAppointment
  );

router.get(
  "/manage",
  isAdminOrDoctor,
  isAuthenticated,
  isLoggedIn("doctor"),
  appointment.renderManageAppointmentsTable
);

router
  .route("/manage/:id")
  .get(
    isAdminOrDoctor,
    isAuthenticated,
    isLoggedIn("doctor"),
    appointment.manageAppointment
  )
  .patch(
    isAdminOrDoctor,
    isAuthenticated,
    isLoggedIn("doctor"),
    appointment.updateAppointment
  )
  .delete(
    isAdminOrDoctor,
    isAuthenticated,
    isLoggedIn("doctor"),
    appointment.deleteAppointment
  );

module.exports = router;

const express = require("express");
const router = express.Router();
const {
    isAuthenticated,
  isAdminOrDoctor,
  dynamicIsLoggedIn,
} = require("../utils/middlewares");
const appointment = require("../controller/appointment");

function setupAppointmentRoutes(){
router
  .route("/create")
  .get(
    isAdminOrDoctor,
    isAuthenticated,
    dynamicIsLoggedIn,
    appointment.renderAppointmentForm
  )
  .post(
    isAdminOrDoctor,
    isAuthenticated,
    dynamicIsLoggedIn,
    appointment.createAppointment
  );

router.get(
  "/manage",
  isAdminOrDoctor,
  isAuthenticated,
  dynamicIsLoggedIn,
  appointment.renderManageAppointmentsTable
);

router
  .route("/manage/:id")
  .get(
    isAdminOrDoctor,
    isAuthenticated,
    dynamicIsLoggedIn,
    appointment.manageAppointment
  )
  .patch(
    isAdminOrDoctor,
    isAuthenticated,
    dynamicIsLoggedIn,
    appointment.updateAppointment
  )
  .delete(
    isAdminOrDoctor,
    isAuthenticated,
    dynamicIsLoggedIn,
    appointment.deleteAppointment
  );
}

setupAppointmentRoutes();

module.exports = router;

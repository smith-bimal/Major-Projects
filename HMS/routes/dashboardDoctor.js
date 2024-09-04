const express = require('express');
const router = express.Router();
const dashboard = require("../controller/dashboard");
const { isAdminOrDoctor, isAuthenticated, isLoggedIn } = require('../utils/middlewares');

router.get("/",
    isAdminOrDoctor,
    isLoggedIn("doctor"),
    isAuthenticated,
    dashboard.doctorDashboard
  );

  module.exports = router;
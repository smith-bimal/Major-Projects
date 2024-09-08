const express = require('express');
const router = express.Router();
const dashboard = require("../controller/dashboard");
const { isAdminOrDoctor, isAuthenticated, dynamicIsLoggedIn } = require('../utils/middlewares');

router.get("/",
  isAdminOrDoctor,
  dynamicIsLoggedIn,
  isAuthenticated,
  dashboard.adminDashboard
);

module.exports = router;
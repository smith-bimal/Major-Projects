const express = require('express');
const router = express.Router();
const dashboard = require("../controller/dashboard");
const { isAdminOrDoctor, isAuthenticated, isLoggedIn } = require('../utils/middlewares');

router.get("/",
  isAdminOrDoctor,
  isLoggedIn("admin"),
  isAuthenticated,
  dashboard.adminDashboard
);

module.exports = router;
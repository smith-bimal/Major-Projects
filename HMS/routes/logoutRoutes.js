const express= require('express');
const router = express.Router();

const { isAdminOrDoctor, isAuthenticated } = require('../utils/middlewares');

const logout = require('../controller/logout');

//Logout Route--------------------------------------------------
router.post("/", isAdminOrDoctor, isAuthenticated, logout.logOutUser);

module.exports = router;
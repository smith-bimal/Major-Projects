const express = require('express');
const router = express.Router();
const loginController = require('../controller/login');

router.get("/", loginController.renderLogin);

//login routes-------------------------------------------------
router.post("/admin", loginController.adminLogin);

router.post("/doctor", loginController.doctorLogin);

module.exports = router;
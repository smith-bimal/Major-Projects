const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { searchQueryHandler } = require('../controllers/search');

router.get("/", wrapAsync(searchQueryHandler));

module.exports = router;
const express = require('express');
const router = express.Router();
const matchingController = require('./matching.controller');

router.post('/run-matching/:offerId', matchingController.runMatching);

module.exports = router;
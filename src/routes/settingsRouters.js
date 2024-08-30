const express = require("express");
const router = express.Router();
const { updateSettings, getSettings } = require('../controller/settingsController');

router.put('/:id', updateSettings);
router.get('/:id', getSettings);

module.exports = router;
const express = require("express");
const router = express.Router();
const { createContact } = require('../controller/contactusController');

router.post('/', createContact);

module.exports = router;
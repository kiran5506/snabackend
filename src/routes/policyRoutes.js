const express = require("express");
const router = express.Router();
const { createPolicy, updatePolicy, getPolicy, getPolicyById } = require('../controller/policyController');

router.post('/create', createPolicy);
router.put('/:id', updatePolicy);
router.post('/get', getPolicy);
router.get('/getById/:id', getPolicyById);

module.exports = router;
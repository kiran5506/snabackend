const express = require("express");
const router = express.Router();
const {userGetById, updateUser, changePassword } = require('../controller/usersController'); 

router.get('/:id', userGetById);
router.put('/:id', updateUser);
router.post('/changePassword', changePassword);

module.exports = router;
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.post('/upload-customer', customerController.uploadCustomerData);
router.post('/register', customerController.registerCustomer);

module.exports = router;

const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController')

router.post('/upload-loan', loanController.uploadLoanData);

router.post('/check-eligibility', loanController.checkLoanEligibility);

router.post('/create-loan', loanController.createLoan);

router.get('/view-loan/:loan_id', loanController.viewLoan);

router.post('/make-payment/:customer_id/:loan_id', loanController.makePayment) 


router.get('/view-statement/:customer_id/:loan_id', loanController.viewStatement)


module.exports = router;


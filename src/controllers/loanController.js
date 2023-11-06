// loanController.js

const exceljs = require('exceljs');
const path = require('path');
const Loan = require('../models/Loan');
const LoanApplication = require('../models/LoanApplication');
const { checkEligibility } = require('./checkEligbility');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');

// Controller for uploading loan data from an Excel file
async function uploadLoanData(req, res) {
    const filePath = path.join(__dirname, '../data/loan_data.xlsx');
    const workbook = new exceljs.Workbook();

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheetData = workbook.getWorksheet(2);

        worksheetData.eachRow(async (row, rowNumber) => {
            if (rowNumber > 1) {
                const [, customer_id, loan_id, loan_amount, tenure, interest_rate, monthly_payment, EMIs_paidOn_time, start_date, end_date] = row.values;
                await Loan.create({
                    customer_id,
                    loan_id,
                    loan_amount,
                    tenure,
                    interest_rate,
                    monthly_payment,
                    EMIs_paidOn_time,
                    start_date,
                    end_date,
                });
            }
        });
        res.status(201).json({ message: "Excel Sheet data are transferred in the MySQL database successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error reading Excel file", error: error.message });
    }
}

// Controller for checking loan eligibility
async function checkLoanEligibility(req, res) {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;

    const customer = await Customer.findAll({
        where: { customer_id },
    });

    const customerLoans = await Loan.findAll({
        where: { customer_id },
    });

    try {
        const eligibilityResult = await checkEligibility(customer, customerLoans, loan_amount, interest_rate, tenure);
        res.status(200).json({
            customer_id,
            ...eligibilityResult,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const createLoan = async (req, res) => {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;

    const customer = await Customer.findAll({
        where: { customer_id },
    });

    const customerLoans = await Loan.findAll({
        where: { customer_id },
    });

    try {
        // Check if a loan application already exists for the customer
        const existingLoanApplication = await LoanApplication.findOne({
            where: {
                customer_id,
                approval_status: true, // Assuming you only want to check approved applications
            },
        });

        if (existingLoanApplication) {
            return res.json({
                message: "A loan application already exists for this customer.",
                loan_id: existingLoanApplication.loan_id,
            });
        }

        // Create a loan application
        const eligibilityResult = await checkEligibility(customer, customerLoans, loan_amount, interest_rate, tenure);

        if (eligibilityResult.approval) {
            const loanApplication = await LoanApplication.create({
                customer_id,
                loan_amount,
                interest_rate: eligibilityResult.corrected_interest_rate,
                approval_status: eligibilityResult.approval,
                tenure,
                monthly_installment: eligibilityResult.monthly_installment,
            });

            return res.json({
                loan_id: loanApplication.loan_id,
                customer_id,
                loan_approved: eligibilityResult.approval,
                message: eligibilityResult.approval ? "Loan approved" : "Loan not approved",
                monthly_installment: eligibilityResult.monthly_installment,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error creating loan", error: error.message });
    }
};

// Create a controller for the `/view-loan/:loan_id` route
const viewLoan = async (req, res) => {
    const loanId = req.params.loan_id;

    try {
        const loan = await LoanApplication.findOne({
            where: {
                loan_id: loanId,
                approval_status: true,
            },
        });

        if (!loan) {
            return res.status(404).json({ message: "Loan not found or not approved" });
        }

        const customer = await Customer.findByPk(loan.customer_id);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const response = {
            loan_id: loan.loan_id,
            customer: {
                id: customer.customer_id,
                first_name: customer.first_name,
                last_name: customer.last_name,
                phone_number: customer.phone_number,
                age: customer.age,
            },
            loan_amount: loan.loan_amount,
            interest_rate: loan.interest_rate,
            monthly_installment: loan.monthly_installment,
            tenure: loan.tenure,
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving loan details", error: error.message });
    }
};

const makePayment = async(req, res) => {
    const customer_id = req.params.customer_id;
    const loan_id = req.params.loan_id;
    const { payment_amount } = req.body;

    try {
        const loan = await LoanApplication.findOne({
            where: {
                loan_id,
                customer_id,
                approval_status: true,
            },
        });

        if (!loan) {
            return res.status(404).json({ message: "Loan not found or not approved" });
        }

        const paymentsSum = await Payment.sum('payment_amount', {
            where: { loan_id },
        });

        const remainingBalance = loan.loan_amount - paymentsSum;

        const dueInstallment = remainingBalance / loan.tenure;

        if (payment_amount < dueInstallment) {
            return res.status(400).json({ message: "Payment amount is less than the due installment amount." });
        }

        await Payment.create({
            loan_id,
            payment_amount,
        });

        loan.paid_amount = paymentsSum;

        if (payment_amount > dueInstallment) {
            loan.monthly_installment = remainingBalance / (loan.tenure - (loan.paid_amount / dueInstallment));
        }

        await loan.save();

        res.json({ message: "Payment successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error making a payment", error: error.message });
    }
}

// Controller for viewing loan statement
 const viewStatement =  async(req, res) => {
    const customer_id = req.params.customer_id;
    const loan_id = req.params.loan_id;

    try {
        const loan = await LoanApplication.findOne({
            where: {
                loan_id,
                customer_id,
                approval_status: true,
            },
        });

        if (!loan) {
            return res.status(404).json({ message: "Loan not found or not approved" });
        }

        const totalAmountPaid = await Payment.sum('payment_amount', {
            where: { loan_id },
        });

        const remainingBalance = loan.loan_amount - totalAmountPaid;

        const remainingEMIs = Math.ceil(remainingBalance / loan.monthly_installment);

        const response = {
            customer_id,
            loan_id,
            principal: loan.loan_amount,
            interest_rate: loan.interest_rate,
            amount_paid: totalAmountPaid,
            monthly_installment: loan.monthly_installment,
            repayments_left: remainingEMIs,
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving loan statement", error: error.message });
    }
}


module.exports = { uploadLoanData, checkLoanEligibility, createLoan, viewLoan, makePayment, viewStatement };

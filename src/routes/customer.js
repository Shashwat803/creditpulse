const express = require('express');
const exceljs = require('exceljs');
const Customer = require('../models/Customer');
const path = require('path');
const Loan = require('../models/Loan');
const router = express.Router();

router.post('/upload-customer', async (req, res) => {
    const filePath = path.join(__dirname, '../data/customer_data.xlsx');
    const workbook = new exceljs.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
        const worksheetData = workbook.getWorksheet(1);
        worksheetData.eachRow(async (row, rowNumber) => {
            if (rowNumber > 1) {
                const [, customer_id, first_name, last_name, age, phone_number, month_salary, approved_limit] = row.values;

                await Customer.create({
                    customer_id,
                    first_name,
                    last_name,
                    age,
                    phone_number,
                    month_salary,
                    approved_limit
                });
            }
        });

        res.status(201).json({ message: "Excel Sheet data are tranfered in mysql db successfully" })
    } catch (error) {
        res.status(500).json({ message: "Error reading Excel file", error: error.message });
    }

});


router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, age, monthly_salary, phone_number } = req.body;
        const approved_limit = Math.ceil(36 * monthly_salary / 100000) * 100000;
        const existingCustomer = await Customer.findOne({
            where: {
                first_name,
                last_name,
                phone_number,
            },
        });
        if (existingCustomer) {
            return res.status(409).json({ message: 'Customer already exists' });
        }
        const newCustomer = await Customer.create({
            first_name,
            last_name,
            age,
            monthly_salary,
            phone_number,
            approved_limit,
        });
        res.status(201).json({
            customer_id: newCustomer.customer_id,
            name: `${newCustomer.first_name} ${newCustomer.last_name}`,
            age: newCustomer.age,
            monthly_salary: newCustomer.monthly_salary,
            approved_limit: newCustomer.approved_limit,
            phone_number: newCustomer.phone_number,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error while registering customer', error: error });
    }
});


module.exports = router;

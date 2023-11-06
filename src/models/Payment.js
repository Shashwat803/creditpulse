const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const LoanApplication = require('./LoanApplication');

const Payment = sequelize.define('Payment', {
    payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    loan_id: {
        type: DataTypes.INTEGER,
        references: {
            model: LoanApplication,
            key: 'loan_id',
        },
    },
    payment_amount: DataTypes.FLOAT,
    // Add more fields like payment date, payment method, etc., as needed.
});

module.exports = Payment;
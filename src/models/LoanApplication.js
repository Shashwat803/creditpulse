const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')
const Customer = require('./Customer')
const LoanApplication = sequelize.define('LoanApplication', {
    loan_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Customer,
            key: 'customer_id',
        }
    },
    loan_amount: DataTypes.BIGINT,
    interest_rate: DataTypes.DECIMAL(10, 2),
    tenure: DataTypes.INTEGER,
    approval_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default to not approved
    },
    monthly_installment: DataTypes.FLOAT, // To store the monthly installment
}, {
    timestamps: false
});

module.exports = LoanApplication

const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')
const Customer = require('./Customer')

const Loan = sequelize.define('Loan', {
    customer_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Customer,
            key: 'customer_id',
        }
    },
    loan_id: {
        type: DataTypes.INTEGER,
    },
    loan_amount: DataTypes.BIGINT,
    tenure: DataTypes.INTEGER,
    interest_rate: DataTypes.DECIMAL(10, 2),
    monthly_payment: DataTypes.INTEGER,
    EMIs_paidOn_time: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
},{
    timestamps:false
})

Loan.belongsTo(Customer, { foreignKey: 'customer_id' })
module.exports = Loan
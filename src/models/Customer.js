const {DataTypes} = require('sequelize')
const sequelize = require('../config/db')

const Customer = sequelize.define('Customer',{
    customer_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        unique:true
    },
    first_name:DataTypes.STRING,
    last_name:DataTypes.STRING,
    age:DataTypes.INTEGER,
    phone_number:DataTypes.BIGINT,
    month_salary:DataTypes.INTEGER,
    approved_limit:DataTypes.INTEGER
},{
    timestamps:false
})

module.exports = Customer
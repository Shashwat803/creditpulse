const {Sequelize} = require('sequelize')
require('dotenv').config()
const sequelize = new Sequelize(process.env.DBNAME,process.env.DBUSERNAME, process.env.DBPASSWORD,{
    host:process.env.DBHOST ,// has to db
    dialect:process.env.DIALECT
})

module.exports = sequelize
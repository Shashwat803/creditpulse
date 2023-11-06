
const express = require('express');
const app = express();
const db = require('./src/config/db');
const customer = require('./src/routes/customer')
const loan = require('./src/routes/loan')

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/api/customer',customer)
app.use('/api/loan',loan)


db.authenticate()
.then(()=>{
  console.log("Connected to database");
  return db.sync()
})
.then(()=>{
  app.listen(3000, ()=>{
    console.log("Server is running on port 3000");
  })
})

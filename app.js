const express = require('express');
const customerRoutes = require('./routes/customerRouter'); // Adjust path if needed
const eligibilityRoutes = require('./routes/eligibilityRoutes');
const loanRoutes = require('./routes/loanRoutes');
const viewLoanRoutes = require('./routes/viewloanRoutes');
const paymentRoute = require("./routes/paymentRoutes")
const viewStatementRoutes = require("./routes/viewStatementRoutes");

const pool = require("./db/pooldb")
require('dotenv').config();


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'my_new_database',
  password: 'ayush',
  port: 5432,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'', (err, res) => {
  if (err) {
      console.error('Error checking connection:', err);
  } else {
      console.log('Database connected successfully!');
      console.log('Relations (tables) in the Public schema:');
      res.rows.forEach(row => console.log(row.table_name));
  }
});

app.use('/customer', customerRoutes);  
app.use('/eligibility', eligibilityRoutes)
app.use('/loan', loanRoutes)
app.use('/view', viewLoanRoutes)
app.use('/payment-view', paymentRoute)
app.use("/statement", viewStatementRoutes)



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

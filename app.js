const express = require('express');
const { Pool } = require('pg');
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

app.post('/register', async (req, res) => {
  try {
      const { first_name, last_name, age, monthly_income, phone_number } = req.body;

      // Input Validation
      if (!first_name || !last_name || !age || !monthly_income || !phone_number) {
          return res.status(400).json({ error: 'All fields are required' });
      }

      if (typeof age !== 'number' || age <= 0) {
          return res.status(400).json({ error: 'Invalid age' });  
      }

      if (typeof monthly_income !== 'number' || monthly_income <= 0) {
          return res.status(400).json({ error: 'Invalid monthly income' });  
      }

      // Phone number validation (you can add more sophisticated checks)
      if (typeof phone_number !== 'string' || phone_number.length < 10) {
          return res.status(400).json({ error: 'Invalid phone number' });
      }

      // Calculate approved limit
      const approved_limit = Math.round(36 * monthly_income / 100000) * 100000;

      // Execute the SQL query
      const result = await pool.query(
          `INSERT INTO "Customer" 
           (first_name, last_name, age, phone_number, monthly_income, approved_limit) 
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, first_name, last_name, age, monthly_income, approved_limit, phone_number`,
          [first_name, last_name, age, phone_number, monthly_income, approved_limit]
      );

      if (result.rowCount === 1) {
          const newCustomer = result.rows[0];
          res.status(201).json({ // 201 Created
              message: 'Registration successful', 
              customer: { 
                  customer_id: newCustomer.id,
                  name: `${newCustomer.first_name} ${newCustomer.last_name}`,
                  age: newCustomer.age,
                  monthly_income: newCustomer.monthly_income,
                  approved_limit: newCustomer.approved_limit,
                  phone_number: newCustomer.phone_number,
   
              }
          });
      } else {
          res.status(500).json({ error: 'Registration failed. Please try again.' });
      }
  } catch (error) {
      console.error("Error during registration:", error);
      if (error.code === '23505') { // Unique constraint violation
          res.status(409).json({ error: 'A customer with this phone number already exists.' });
      } else {
          res.status(500).json({ error: 'Registration failed. Please try again.' });
      }
  }
});

app.post('/check-eligibility', async (req, res) => {
  try {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;

    // Fetch customer details from the database
    const customer = await getCustomerById(customer_id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate credit score for the customer based on loan data
    let creditScore = calculateCreditScore(customer);

    // Adjust interest rate based on credit score
    let correctedInterestRate = adjustInterestRate(creditScore, interest_rate);

    // Check if loan can be approved based on credit score and monthly salary
    let canApproveLoan = canApproveLoanBasedOnCredit(creditScore, customer, loan_amount);

    // Calculate monthly installment
    let monthlyInstallment = calculateMonthlyInstallment(loan_amount, correctedInterestRate, tenure);

    // Prepare response body
    const responseBody = {
      customer_id: customer_id,
      approval: canApproveLoan,
      interest_rate: interest_rate,
      corrected_interest_rate: correctedInterestRate,
      tenure: tenure,
      monthly_installment: monthlyInstallment
    };

    res.status(200).json(responseBody);
  } catch (error) {
    console.error("Error checking loan eligibility:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to fetch customer details by customer_id
async function getCustomerById(customerId) {
  const query = `SELECT * FROM "Customer" WHERE customer_id = $1`;
  const values = [customerId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Function to calculate credit score based on customer's loan history
// Function to calculate credit score based on specified components
function calculateCreditScore(customer) {
  let creditScore = 0;

  // Component i: Past Loans paid on time
  // Assuming emis_paid_on_time is a property of the customer object
  creditScore += customer.emis_paid_on_time || 0;

  // Component ii: No of loans taken in past
  // If customer.loan is an array representing past loans, use its length
  // Otherwise, use a default value of 0
  creditScore += customer.loan ? customer.loan.length : 0;

  // Component iii: Loan activity in current year
  // Assuming loan_activity_current_year is a property of the customer object
  creditScore += customer.loan_activity_current_year || 0;

  // Component iv: Loan approved volume
  // Assuming loan_approved_volume is a property of the customer object
  creditScore += customer.loan_approved_volume || 0;

  // Component v: If sum of current loans of customer > approved limit of customer, credit score = 0
  if (customer.current_debt > customer.approved_limit) {
      creditScore = 0;
  }

  // Credit score cannot be fractional, rounding to nearest integer
  return Math.round(creditScore);
}


// Function to adjust interest rate based on credit score
function adjustInterestRate(creditScore, interestRate) {
  if (creditScore > 50) {
    return interestRate;
  } else if (creditScore > 30) {
    return Math.max(interestRate, 12); // Minimum interest rate 12%
  } else if (creditScore > 10) {
    return Math.max(interestRate, 16); // Minimum interest rate 16%
  } else {
    return 0; // Don't approve any loans
  }
}

// Function to check if loan can be approved based on credit score and monthly salary
function canApproveLoanBasedOnCredit(creditScore, customer, loanAmount) {
  // If credit score is below 10 or if sum of all current EMIs > 50% of monthly salary, don't approve any loans
  if (creditScore <= 10 || (customer.current_debt / customer.monthly_income) > 0.5) {
    return false;
  }

  // Otherwise, approve loan based on credit score
  return true;
}

// Function to calculate monthly installment
function calculateMonthlyInstallment(loanAmount, interestRate, tenure) {
  // Implement formula to calculate monthly installment
  // For example:
  let monthlyInstallment = (loanAmount * (interestRate / 1200)) / (1 - Math.pow(1 + (interestRate / 1200), -tenure));
  return monthlyInstallment;
}




app.post('/create-loan', async (req, res) => {
  try {
      // Extract request body fields
      const { customer_id, loan_amount, interest_rate, tenure } = req.body;

      // Fetch customer details from the database
      const customer = await getCustomerById(customer_id);

      if (!customer) {
          return res.status(404).json({ error: 'Customer not found' });
      }

      // Check loan eligibility based on customer's credit score and other criteria
      const loanApprovalResult = await processLoanApproval(customer, loan_amount, interest_rate, tenure);

      // Prepare response body based on loan approval result
      const responseBody = {
          loan_id: loanApprovalResult.loan_id,
          customer_id: customer_id,
          loan_approved: loanApprovalResult.loan_approved,
          message: loanApprovalResult.message,
          monthly_installment: loanApprovalResult.monthly_installment
      };

      res.status(200).json(responseBody);
  } catch (error) {
      console.error("Error processing new loan:", error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to fetch customer details from the database by customer_id
async function getCustomerById(customerId) {
  const query = `SELECT * FROM "Customer" WHERE customer_id = $1`;
  const values = [customerId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Function to process loan approval based on customer's eligibility
async function processLoanApproval(customer, loanAmount, interestRate, tenure) {
  // Placeholder implementation, replace with actual logic to determine loan approval and calculate monthly installment
  const loanApprovalResult = {
      loan_id: null, // Placeholder for loan ID
      loan_approved: true, // Placeholder for loan approval status
      message: "Loan approved", // Placeholder for approval message
      monthly_installment: 1000 // Placeholder for monthly installment
  };

  // Implement your logic to determine loan approval based on customer eligibility

  return loanApprovalResult;
}

app.get('/view-loan/:loan_id', async (req, res) => {
  try {
      const loanId = req.params.loan_id;

      // Fetch loan details and associated customer details from the database
      const loanDetails = await getLoanDetails(loanId);

      if (!loanDetails) {
          return res.status(404).json({ error: 'Loan not found' });
      }

      // Prepare response body
      const responseBody = {
          loan_id: loanDetails.loan_id,
          customer: {
              id: loanDetails.customer_id,
              first_name: loanDetails.first_name,
              last_name: loanDetails.last_name,
              phone_number: loanDetails.phone_number,
              age: loanDetails.age
          },
          loan_approved: loanDetails.loan_approved,
          interest_rate: loanDetails.interest_rate,
          monthly_installment: loanDetails.monthly_installment,
          tenure: loanDetails.tenure
      };

      res.status(200).json(responseBody);
  } catch (error) {
      console.error("Error fetching loan details:", error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to fetch loan details and associated customer details from the database by loan ID
async function getLoanDetails(loanId) {
  const query = `
      SELECT "Loan".loan_id, "Loan".customer_id, "Loan".loan_amount, "Loan".interest_rate, "Loan".monthly_installment, "Loan".tenure,
             "Customer".first_name, "Customer".last_name, "Customer".phone_number, "Customer".age
      FROM "Loan"
      INNER JOIN "Customer" ON "Loan".customer_id = "Customer".customer_id
      WHERE "Loan".loan_id = $1`;
  const values = [loanId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

app.post('/make-payment/:customer_id/:loan_id', async (req, res) => {
  try {
      const customerId = req.params.customer_id;
      const loanId = req.params.loan_id;
      const paymentAmount = req.body.payment_amount;

      // Check if the customer and loan exist
      const customerAndLoanExists = await checkCustomerAndLoanExistence(customerId, loanId);
      if (!customerAndLoanExists) {
          return res.status(404).json({ error: 'Customer or loan not found' });
      }

      // Get loan details including the current EMI details
      const loanDetails = await getLoanDetails(loanId);
      if (!loanDetails) {
          return res.status(404).json({ error: 'Loan not found' });
      }

      // Calculate the remaining EMI amount
      const remainingEMIAmount = loanDetails.monthly_repayment - loanDetails.emi_paid_on_time;

      // Update the EMI details based on the payment amount
      const updatedEMIAmount = Math.max(0, remainingEMIAmount - paymentAmount);
      const updatedEMIPaidOnTime = loanDetails.monthly_repayment - updatedEMIAmount;

      // Update the loan with the new EMI details
      const updateResult = await updateLoanEMIDetails(loanId, updatedEMIAmount, updatedEMIPaidOnTime);

      if (updateResult) {
          return res.status(200).json({ message: 'Payment successful' });
      } else {
          return res.status(500).json({ error: 'Failed to update EMI details' });
      }
  } catch (error) {
      console.error("Error making payment:", error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to check if the customer and loan exist
async function checkCustomerAndLoanExistence(customerId, loanId) {
  const query = `
      SELECT EXISTS (
          SELECT 1 FROM "Customer" WHERE customer_id = $1
      ) AND EXISTS (
          SELECT 1 FROM "Loan" WHERE loan_id = $2 AND customer_id = $1
      )`;
  const values = [customerId, loanId];
  const result = await pool.query(query, values);
  return result.rows[0].exists;
}

// Function to get loan details including the current EMI details
async function getLoanDetails(loanId) {
  const query = `
      SELECT loan_amount, monthly_repayment, emi_paid_on_time
      FROM "Loan"
      WHERE loan_id = $1`;
  const values = [loanId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Function to update the loan with the new EMI details
async function updateLoanEMIDetails(loanId, updatedEMIAmount, updatedEMIPaidOnTime) {
  const query = `
      UPDATE "Loan"
      SET emis_paid_on_time = $1
      WHERE loan_id = $2`;
  const values = [updatedEMIPaidOnTime, loanId];
  const result = await pool.query(query, values);
  return result.rowCount === 1;
}


app.get('/view-statement/:customer_id/:loan_id', async (req, res) => {
  try {
      const customerId = req.params.customer_id;
      const loanId = req.params.loan_id;

      // Check if the customer and loan exist
      const customerAndLoanExists = await checkCustomerAndLoanExistence(customerId, loanId);
      if (!customerAndLoanExists) {
          return res.status(404).json({ error: 'Customer or loan not found' });
      }

      // Get loan statement details
      const loanStatement = await getLoanStatement(customerId, loanId);

      res.status(200).json(loanStatement);
  } catch (error) {
      console.error("Error viewing loan statement:", error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to check if the customer and loan exist
async function checkCustomerAndLoanExistence(customerId, loanId) {
  const query = `
      SELECT EXISTS (
          SELECT 1 FROM "Customer" WHERE customer_id = $1
      ) AND EXISTS (
          SELECT 1 FROM "Loan" WHERE loan_id = $2 AND customer_id = $1
      )`;
  const values = [customerId, loanId];
  const result = await pool.query(query, values);
  return result.rows[0].exists;
}

// Function to get loan statement details
async function getLoanStatement(customerId, loanId) {
  const query = `
      SELECT customer_id, loan_id, loan_amount AS principal, interest_rate, 
             monthly_repayment AS monthly_installment, emis_paid_on_time AS repayments_left
      FROM "Loan"
      WHERE loan_id = $1`;
  const values = [loanId];
  const result = await pool.query(query, values);
  return result.rows[0];
}


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

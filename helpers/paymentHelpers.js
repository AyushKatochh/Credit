const pool = require("../db/pooldb")

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

  module.exports = {
    checkCustomerAndLoanExistence,
    getLoanDetails,
    updateLoanEMIDetails
  }
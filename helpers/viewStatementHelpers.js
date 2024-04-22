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

  
module.exports = {
    checkCustomerAndLoanExistence,
    getLoanStatement
}
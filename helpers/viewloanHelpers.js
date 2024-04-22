const pool = require("../db/pooldb")

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

  module.exports = {
    getLoanDetails
  }
const pool = require("../db/pooldb")

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

module.exports = {
    getCustomerById,
    calculateCreditScore,
    adjustInterestRate,
    canApproveLoanBasedOnCredit,
    calculateMonthlyInstallment
}
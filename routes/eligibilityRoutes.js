const express = require('express');
const eligibilityHelpers = require('../helpers/eligibilityHelpers');
const router = express.Router();

router.post('/check-eligibility', async (req, res) => {
    try {
      const { customer_id, loan_amount, interest_rate, tenure } = req.body;
  
      // Fetch customer details from the database
      const customer = await eligibilityHelpers.getCustomerById(customer_id);
  
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
  
      // Calculate credit score for the customer based on loan data
      let creditScore = eligibilityHelpers.calculateCreditScore(customer);
  
      // Adjust interest rate based on credit score
      let correctedInterestRate = eligibilityHelpers.adjustInterestRate(creditScore, interest_rate);
  
      // Check if loan can be approved based on credit score and monthly salary
      let canApproveLoan = eligibilityHelpers.canApproveLoanBasedOnCredit(creditScore, customer, loan_amount);
  
      // Calculate monthly installment
      let monthlyInstallment = eligibilityHelpers.calculateMonthlyInstallment(loan_amount, correctedInterestRate, tenure);
  
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

  module.exports = router
  
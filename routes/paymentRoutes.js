const express = require('express');
const router = express.Router(); 
const paymentHelpers = require('../helpers/paymentHelpers'); // Or adjust the path if needed 

router.post('/make-payment/:customer_id/:loan_id', async (req, res) => {
    try {
        const customerId = req.params.customer_id;
        const loanId = req.params.loan_id;
        const paymentAmount = req.body.payment_amount;
  
        // Check if the customer and loan exist
        const customerAndLoanExists = await paymentHelpers.checkCustomerAndLoanExistence(customerId, loanId);
        if (!customerAndLoanExists) {
            return res.status(404).json({ error: 'Customer or loan not found' });
        }
  
        // Get loan details including the current EMI details
        const loanDetails = await paymentHelpers.getLoanDetails(loanId);
        if (!loanDetails) {
            return res.status(404).json({ error: 'Loan not found' });
        }
  
        // Calculate the remaining EMI amount
        const remainingEMIAmount = loanDetails.monthly_repayment - loanDetails.emi_paid_on_time;
  
        // Update the EMI details based on the payment amount
        const updatedEMIAmount = Math.max(0, remainingEMIAmount - paymentAmount);
        const updatedEMIPaidOnTime = loanDetails.monthly_repayment - updatedEMIAmount;
  
        // Update the loan with the new EMI details
        const updateResult = await paymentHelpers.updateLoanEMIDetails(loanId, updatedEMIAmount, updatedEMIPaidOnTime);
  
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

  module.exports = router;
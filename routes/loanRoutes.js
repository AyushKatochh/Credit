const express = require('express');

const loanHelpers = require('../helpers/loanHelpers'); // Or adjust the path if needed 

const router = express.Router(); 

router.post('/create-loan', async (req, res) => {
    try {
        // Extract request body fields
        const { customer_id, loan_amount, interest_rate, tenure } = req.body;
  
        // Fetch customer details from the database
        const customer = await loanHelpers.getCustomerById(customer_id);
  
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
  
        // Check loan eligibility based on customer's credit score and other criteria
        const loanApprovalResult = await loanHelpers.processLoanApproval(customer, loan_amount, interest_rate, tenure);
  
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
module.exports = router; 
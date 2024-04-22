const express = require('express');
const router = express.Router(); 
const viewStatementHelpers = require('../helpers/viewStatementHelpers'); // Or adjust the path if needed 

router.get('/view-statement/:customer_id/:loan_id', async (req, res) => {
    try {
        const customerId = req.params.customer_id;
        const loanId = req.params.loan_id;
  
        // Check if the customer and loan exist
        const customerAndLoanExists = await viewStatementHelpers.checkCustomerAndLoanExistence(customerId, loanId);
        if (!customerAndLoanExists) {
            return res.status(404).json({ error: 'Customer or loan not found' });
        }
  
        // Get loan statement details
        const loanStatement = await viewStatementHelpers.getLoanStatement(customerId, loanId);
  
        res.status(200).json(loanStatement);
    } catch (error) {
        console.error("Error viewing loan statement:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
  });

  module.exports = router;
  
const express = require('express');
const router = express.Router(); 
const viewloanHelpers = require('../helpers/viewloanHelpers'); // Or adjust the path if needed 

router.get('/view-loan/:loan_id', async (req, res) => {
    try {
        const loanId = req.params.loan_id;
  
        // Fetch loan details and associated customer details from the database
        const loanDetails = await viewloanHelpers.getLoanDetails(loanId);
  
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


module.exports = router;


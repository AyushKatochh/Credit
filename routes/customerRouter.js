const express = require("express");
const router = express.Router();
const pool = require("../db/pooldb")






router.post('/register', async (req, res) => {
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

  module.exports = router;
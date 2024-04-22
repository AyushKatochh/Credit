const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

const customersCsv = fs.readFileSync('./data/customer_data.csv', 'utf8');
const loansCsv = fs.readFileSync('./data/loan_data.csv', 'utf8');

async function importData() {
  try {
    await prisma.customer.createMany({
      data: customersCsv.split('\n').filter(line => line.trim()).slice(1).map((line) => {
        const [customer_id, first_name, last_name, age, phone_number, monthly_salary, approved_limit, current_debt] = line.split(',');
        return {
          customer_id: parseInt(customer_id),
          first_name: first_name,
          last_name: last_name,
          age: parseInt(age),
          phone_number: (phone_number),
          monthly_income: parseInt(monthly_salary),
          approved_limit: parseInt(approved_limit),
          current_debt: parseInt(current_debt)
        };
      }),
      skipDuplicates: true,
    });

    // Import loans data
    await prisma.loan.createMany({
      data: loansCsv.split('\n').filter(line => line.trim()).slice(1).map((line, index) => {
        const [customer_id, loan_id, loan_amount, tenure, interest_rate, monthly_repayment, emis_paid_on_time, start_date, end_date] = line.split(',');
        return {
          customer_id: parseInt(customer_id),
          loan_id: parseInt(loan_id),
          loan_amount: parseFloat(loan_amount),
          interest_rate: parseFloat(interest_rate),
          tenure: parseInt(tenure),
          monthly_repayment: parseFloat(monthly_repayment),
          emis_paid_on_time: parseInt(emis_paid_on_time),
          start_date,
          end_date,
        };
      }),
      skipDuplicates: true,
    });

    console.log('Data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();

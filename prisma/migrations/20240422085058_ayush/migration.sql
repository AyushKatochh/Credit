-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "customer_id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "phone_number" TEXT NOT NULL,
    "monthly_income" INTEGER NOT NULL,
    "approved_limit" INTEGER NOT NULL,
    "current_debt" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "loan_amount" DOUBLE PRECISION NOT NULL,
    "interest_rate" DOUBLE PRECISION NOT NULL,
    "tenure" INTEGER NOT NULL,
    "monthly_repayment" DOUBLE PRECISION NOT NULL,
    "emis_paid_on_time" INTEGER NOT NULL,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT NOT NULL,
    "monthly_installment" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

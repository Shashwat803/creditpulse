// eligibility.js

const calculateEmi = (loanAmount, monthlyInterestRate, loanTenureMonths) => {
    const EMI = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTenureMonths)) /
        (Math.pow(1 + monthlyInterestRate, loanTenureMonths) - 1);
    return EMI;
}

const checkEligibility = async (customer, customerLoans, loan_amount, interest_rate, tenure) => {
    try {
        const creditScore = calculateCreditScore(customer, customerLoans, loan_amount);
        const { monthly_salary, approved_limit } = customer[0];
        const AllCurrentEMIs = calculateTotalCurrentEMIs(customerLoans);

        let approval = false;
        let corrected_interest_rate = null;

        if (creditScore > 30) {
            approval = true;
            corrected_interest_rate = Math.max(interest_rate, 12);
        } else if (creditScore > 30) {
            approval = true;
            corrected_interest_rate = Math.max(interest_rate, 16);
        } else if (creditScore > 10) {
            approval = true;
            corrected_interest_rate = 16;
        }

        if (loan_amount > approved_limit || AllCurrentEMIs > 0.5 * monthly_salary) {
            approval = false;
        }

        const loanAmount = parseFloat(loan_amount);
        const annualInterestRate = parseFloat(interest_rate) / 100;
        const monthlyInterestRate = annualInterestRate / 12;
        const loanTenureMonths = parseInt(tenure);
        const monthly_installment = calculateEmi(loanAmount, monthlyInterestRate, loanTenureMonths);

        return {
            approval,
            interest_rate,
            corrected_interest_rate,
            monthly_installment,
        };
    } catch (error) {
        console.error(error);
        throw new Error("Error processing eligibility check");
    }
};

const calculateCreditScore = (customer, customerLoans, loan_amount) => {
    // Calculate credit score based on the provided components
    // You can adjust the following values as needed
    const percentageOfTotalEmiPaid = calculatePercentageOfTotalEmiPaid(customerLoans);
    const numOfLoans = customerLoans.length;
    const currentYearLoans = customerLoans.filter((loan) => new Date(loan.start_date).getFullYear() === new Date().getFullYear());
    const loanVolume = customerLoans.reduce((acc, loan) => acc + loan.loan_amount, 0);

    let creditScore = 0;

    if (loan_amount > customer[0].approved_limit) {
        creditScore = 0;
    } else {
        if (percentageOfTotalEmiPaid > 50) creditScore += 20;
        if (numOfLoans <= 1) creditScore += 20;
        if (currentYearLoans.length >= 0) creditScore += 20;
        if (loanVolume > customer[0].approved_limit) creditScore += 20;
    }

    return creditScore;
};

const calculateTotalCurrentEMIs = (customerLoans) => {
    return customerLoans.reduce((acc, loan) => acc + loan.monthly_payment, 0);
};

const calculatePercentageOfTotalEmiPaid = (customerLoans) => {
    const EMIsPaidOnTime = customerLoans.reduce((acc, loan) => acc + loan.EMIs_paidOn_time, 0);
    const totalTenure = customerLoans.reduce((acc, loan) => acc + loan.tenure, 0);
    return Math.floor((EMIsPaidOnTime / totalTenure) * 100);
};

module.exports = { checkEligibility};

/**
 * EMI Calculator - Calculation Logic, UI Updates, Amortization Schedule, and Charts
 */

document.addEventListener('DOMContentLoaded', () => {
    // Input elements
    const loanAmountInput = document.getElementById('loanAmount');
    const interestRateInput = document.getElementById('interestRate');
    const loanTenureInput = document.getElementById('loanTenure');
    
    // Toggle buttons
    const btnYears = document.getElementById('btnYears');
    const btnMonths = document.getElementById('btnMonths');
    
    // Result displays
    const displayEMI = document.getElementById('monthlyEMI');
    const displayInterest = document.getElementById('totalInterest');
    const displayTotal = document.getElementById('totalPayment');
    const amortizationBody = document.getElementById('amortizationBody');

    let tenureUnit = 'years';
    let emiChart = null;

    /**
     * Format numbers as Indian Currency (₹)
     */
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    /**
     * Update Doughnut Chart
     */
    const updateChart = (principal, totalInterest) => {
        const ctx = document.getElementById('emiChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (emiChart) {
            emiChart.destroy();
        }

        const total = principal + totalInterest;
        const principalPct = ((principal / total) * 100).toFixed(1);
        const interestPct = ((totalInterest / total) * 100).toFixed(1);

        emiChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [`Principal (${principalPct}%)`, `Interest (${interestPct}%)`],
                datasets: [{
                    data: [principal, totalInterest],
                    backgroundColor: ['#6366f1', '#a855f7'],
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            font: {
                                family: 'Outfit',
                                size: 12
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    };

    /**
     * Generate Monthly Amortization Schedule
     */
    const generateAmortizationSchedule = (P, annualRate, N, monthlyEMI) => {
        amortizationBody.innerHTML = '';
        let remainingBalance = P;
        const R = (annualRate / 12) / 100;

        for (let month = 1; month <= N; month++) {
            const interestPaid = remainingBalance * R;
            const principalPaid = monthlyEMI - interestPaid;
            remainingBalance = remainingBalance - principalPaid;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${month}</td>
                <td>${formatCurrency(principalPaid)}</td>
                <td>${formatCurrency(interestPaid)}</td>
                <td>${formatCurrency(Math.max(0, remainingBalance))}</td>
            `;
            amortizationBody.appendChild(row);
        }
    };

    /**
     * Core EMI Calculation Logic
     */
    const calculateEMI = () => {
        const P = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(interestRateInput.value);
        let N = parseFloat(loanTenureInput.value);

        if (isNaN(P) || isNaN(annualRate) || isNaN(N) || P <= 0 || annualRate <= 0 || N <= 0) {
            displayEMI.innerText = '₹ 0';
            displayInterest.innerText = '₹ 0';
            displayTotal.innerText = '₹ 0';
            amortizationBody.innerHTML = '';
            if (emiChart) emiChart.destroy();
            return;
        }

        if (tenureUnit === 'years') N = N * 12;

        const R = (annualRate / 12) / 100;
        const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        const totalPayment = emi * N;
        const totalInterest = totalPayment - P;

        displayEMI.innerText = formatCurrency(emi);
        displayInterest.innerText = formatCurrency(totalInterest);
        displayTotal.innerText = formatCurrency(totalPayment);

        generateAmortizationSchedule(P, annualRate, N, emi);
        updateChart(P, totalInterest);
    };

    /**
     * Toggle handle logic
     */
    const handleToggle = (unit) => {
        tenureUnit = unit;
        if (unit === 'years') {
            btnYears.classList.add('active');
            btnMonths.classList.remove('active');
        } else {
            btnMonths.classList.add('active');
            btnYears.classList.remove('active');
        }
        calculateEMI();
    };

    // Event Listeners
    btnYears.addEventListener('click', () => handleToggle('years'));
    btnMonths.addEventListener('click', () => handleToggle('months'));

    [loanAmountInput, interestRateInput, loanTenureInput].forEach(input => {
        input.addEventListener('input', calculateEMI);
    });

    console.log('EMI Calculator, Schedule & Charts Initialized');
});

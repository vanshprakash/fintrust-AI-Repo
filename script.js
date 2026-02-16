document.addEventListener('DOMContentLoaded', () => {
    // 0. Sidebar Toggle (for responsive design)
    const hamburgerMenuBtn = document.querySelector('.hamburger-menu');
    const mainTopNav = document.querySelector('.main-top-nav');

    if (hamburgerMenuBtn && mainTopNav) {
        hamburgerMenuBtn.addEventListener('click', () => {
            mainTopNav.classList.toggle('active');
        });
    }

    // Close top navigation when a navigation item is clicked on small screens
    document.querySelectorAll('.main-top-nav .nav-links li a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Handle active class for navigation items
            document.querySelector('.main-top-nav .nav-links li a.active')?.classList.remove('active');
            this.classList.add('active');

            // Close top navigation if open on small screens
            if (mainTopNav && mainTopNav.classList.contains('active') && window.innerWidth <= 992) {
                mainTopNav.classList.remove('active');
            }

            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#settings') { // Exclude settings for now
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 1. Profile Dropdown Toggle
    const profileDropdown = document.querySelector('.profile-dropdown');
    const profileButton = profileDropdown ? profileDropdown.querySelector('.icon-button') : null;
    const dropdownMenu = profileDropdown ? profileDropdown.querySelector('.dropdown-menu') : null;

    if (profileButton && dropdownMenu) {
        profileButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent document click from immediately closing
            profileDropdown.classList.toggle('active');
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', (event) => {
            if (!profileDropdown.contains(event.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    // 3. Animated Stats Counter (Intersection Observer for activation)
    const statsCounterSection = document.querySelector('.stats-counter');
    if (statsCounterSection) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.querySelectorAll('.stat-number').forEach(span => {
                        const target = +span.getAttribute('data-target');
                        let current = 0;
                        const increment = target / 200; // Adjust speed

                        const updateCounter = () => {
                            current += increment;
                            if (current < target) {
                                span.textContent = Math.ceil(current);
                                requestAnimationFrame(updateCounter);
                            } else {
                                span.textContent = target;
                            }
                        };
                        updateCounter();
                    });
                    observer.unobserve(statsCounterSection); // Stop observing once animated
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% of the section is visible
        observer.observe(statsCounterSection);
    }


    // 4. Credit Score Circular Progress
    const creditScoreCanvas = document.getElementById('creditScoreCanvas');
    if (creditScoreCanvas) {
        const ctx = creditScoreCanvas.getContext('2d');
        const scoreValueElem = document.querySelector('.score-value');
        const score = parseInt(scoreValueElem.textContent);
        const maxScore = 850; // Typical max credit score

        const drawCreditScore = (currentScore) => {
            const percentage = currentScore / maxScore;
            const endAngle = Math.PI * 2 * percentage;

            creditScoreCanvas.width = 180;
            creditScoreCanvas.height = 180;

            // Background circle
            ctx.beginPath();
            ctx.arc(90, 90, 80, 0, Math.PI * 2);
            ctx.lineWidth = 15;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.stroke();

            // Progress circle
            ctx.beginPath();
            ctx.arc(90, 90, 80, -Math.PI / 2, endAngle - Math.PI / 2);
            ctx.lineWidth = 15;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#4CAF50'; // Primary color
            ctx.stroke();
        };

        // Animate credit score on load
        let currentAnimatedScore = 0;
        const animationDuration = 1000; // ms
        const startTime = performance.now();

        const animateScore = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            currentAnimatedScore = progress * score;
            scoreValueElem.textContent = Math.floor(currentAnimatedScore);
            drawCreditScore(currentAnimatedScore);

            if (progress < 1) {
                requestAnimationFrame(animateScore);
            }
        };
        requestAnimationFrame(animateScore);
    }

    // 5. Approval Probability Meter
    const probabilityBar = document.querySelector('.probability-bar');
    const probabilityValue = document.querySelector('.probability-value');
    if (probabilityBar && probabilityValue) {
        const targetWidth = parseInt(probabilityBar.style.width); // e.g., "70%"
        probabilityBar.style.width = '0%'; // Start from 0 for animation

        let currentWidth = 0;
        const animationDuration = 800;
        const startTime = performance.now();

        const animateProbability = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            currentWidth = progress * parseInt(targetWidth);
            probabilityBar.style.width = `${currentWidth}%`;
            probabilityValue.textContent = `${Math.floor(currentWidth)}%`;

            if (progress < 1) {
                requestAnimationFrame(animateProbability);
            }
        };
        requestAnimationFrame(animateProbability);
    }

    // 6. Generic Bar Chart Function (for alternative data breakdown and explainable AI)
    function drawBarChart(canvasId, data, labels, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const chartWidth = canvas.width;
        const chartHeight = canvas.height;
        const barWidth = chartWidth / (data.length * 1.5); // Adjust spacing
        const maxVal = Math.max(...data);
        const padding = 10;

        // Draw bars
        data.forEach((val, index) => {
            const barHeight = (val / maxVal) * (chartHeight - padding * 2);
            const x = index * (barWidth * 1.5) + padding;
            const y = chartHeight - barHeight - padding;

            ctx.fillStyle = color;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw labels
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '10px Poppins';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index], x + barWidth / 2, chartHeight - padding / 2);
        });
    }

    // Example usage for Alternative Data Breakdown
    const altData = [80, 95, 60, 75]; // Scores for UPI, Utility, Mobile, Spending
    const altLabels = ['UPI', 'Utility', 'Mobile', 'Spending'];
    drawBarChart('alternativeDataChart', altData, altLabels, '#2196F3');

    // Example usage for Explainable AI Contribution
    drawBarChart('incomeStabilityChart', [90, 70, 50, 60], ['Factor A', 'Factor B', 'Factor C', 'Factor D'], '#FFC107');
    drawBarChart('paymentHistoryChart', [85, 65, 75, 55], ['Factor A', 'Factor B', 'Factor C', 'Factor D'], '#FFC107');
    drawBarChart('loanApplicationsChart', [70, 80, 60, 90], ['Factor A', 'Factor B', 'Factor C', 'Factor D'], '#FFC107');


    // 7. Loan Simulator Logic and Probability Gauge
    const monthlyIncomeInput = document.getElementById('monthlyIncome');
    const expensesInput = document.getElementById('expenses');
    const loanAmountInput = document.getElementById('loanAmount');
    const loanTermInput = document.getElementById('loanTerm');
    const calculateLoanBtn = document.getElementById('calculateLoan');
    const approvalStatusSpan = document.querySelector('.approval-status');
    const emiValueSpan = document.querySelector('.emi-value');
    const probabilityGaugeCanvas = document.getElementById('probabilityGauge');
    const gaugeValueDiv = document.querySelector('.gauge-value');

    const calculateLoanAndPrediction = () => {
        const income = parseFloat(monthlyIncomeInput.value);
        const expenses = parseFloat(expensesInput.value);
        const loanAmount = parseFloat(loanAmountInput.value);
        const loanTerm = parseFloat(loanTermInput.value);

        if (isNaN(income) || isNaN(expenses) || isNaN(loanAmount) || isNaN(loanTerm) || loanTerm <= 0) {
            alert('Please enter valid numbers for all fields and a positive loan term.');
            return;
        }

        // Simple EMI Calculation (Illustrative, not real-world accurate)
        // Assuming a fixed annual interest rate for simplicity, e.g., 10%
        const annualInterestRate = 0.10;
        const monthlyInterestRate = annualInterestRate / 12;
        const emi = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTerm)) / (Math.pow(1 + monthlyInterestRate, loanTerm) - 1);

        emiValueSpan.textContent = `INR ${emi.toFixed(2)}`;

        // --- Structured AI-like Scoring Logic ---
        let score = 0;
        let explanation = [];

        const disposableIncome = income - expenses; // Already calculated
        const expenseRatio = expenses / income;
        const emiRatio = emi / income;

        // 1️⃣ Income Strength
        if (income >= 50000) {
            score += 30;
            explanation.push("Strong monthly income increased your score.");
        } else if (income >= 30000) {
            score += 20;
            explanation.push("Moderate income contributed positively.");
        } else {
            score += 10;
            explanation.push("Lower income slightly reduced your approval strength.");
        }

        // 2️⃣ Expense Ratio
        if (expenseRatio < 0.4) {
            score += 30;
            explanation.push("Low expense ratio shows good financial discipline.");
        } else if (expenseRatio < 0.7) {
            score += 15;
            explanation.push("Moderate expense ratio slightly affected score.");
        } else {
            score += 5;
            explanation.push("High expense ratio negatively impacted your score.");
        }

        // 3️⃣ EMI Burden
        if (emiRatio < 0.3) {
            score += 30;
            explanation.push("EMI burden is healthy compared to income.");
        } else if (emiRatio < 0.5) {
            score += 15;
            explanation.push("EMI burden is manageable but slightly risky.");
        } else {
            score += 5;
            explanation.push("High EMI burden reduced approval probability.");
        }

        // Final Probability
        let approvalProbability = (score / 90) * 100;

        // Update approval status text
        if (approvalProbability >= 70) {
            approvalStatusSpan.textContent = 'Highly Likely';
            approvalStatusSpan.className = 'approval-status approved';
        } else if (approvalProbability >= 40) {
            approvalStatusSpan.textContent = 'Possible';
            approvalStatusSpan.className = 'approval-status pending';
        } else {
            approvalStatusSpan.textContent = 'Unlikely';
            approvalStatusSpan.className = 'approval-status denied';
        }

        // Animate probability gauge
        drawProbabilityGauge(probabilityGaugeCanvas, approvalProbability);

        const explanationContainer = document.getElementById("dynamicExplanation");
        explanationContainer.innerHTML = "";

        explanation.forEach(reason => {
            const li = document.createElement("li");
            li.textContent = reason;
            explanationContainer.appendChild(li);
        });
    };

    if (calculateLoanBtn) {
        calculateLoanBtn.addEventListener('click', calculateLoanAndPrediction);
        // Initial calculation on load
        calculateLoanAndPrediction();
    }

    // Probability Gauge Drawing
    function drawProbabilityGauge(canvas, probability) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        canvas.width = 200;
        canvas.height = 100; // Half circle

        const centerX = canvas.width / 2;
        const centerY = canvas.height; // Bottom center
        const radius = canvas.width / 2 - 10; // Inner radius for the arc

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
        ctx.lineWidth = 20;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();

        // Progress arc
        const startAngle = Math.PI; // 180 degrees
        const endAngle = Math.PI + (probability / 100) * Math.PI; // From 180 to 360 degrees

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';

        // Gradient for the gauge
        const gradient = ctx.createLinearGradient(0, centerY, canvas.width, centerY);
        gradient.addColorStop(0, '#D32F2F'); // Red for low
        gradient.addColorStop(0.5, '#FFC107'); // Amber for medium
        gradient.addColorStop(1, '#4CAF50'); // Green for high
        ctx.strokeStyle = gradient;
        ctx.stroke();

        // Update gauge value text
        gaugeValueDiv.textContent = `${Math.floor(probability)}%`;
    }
});

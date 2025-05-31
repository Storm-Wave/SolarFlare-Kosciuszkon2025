// =================== helper functions =======================
function fillArray(low, iters) {
    let a = []
    for (let i = low; i <= low + iters; i++) {
        a.push(i);
    }
    return a;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// =================== END HELPER FUNCTION ===================

// Return on investment yearly
function returnOnInvestment(data){
    const ctx = document.getElementById('returnOnInvestment');
    const d = new Date();
    let currYear = d.getFullYear();
    // console.log(data)
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: fillArray(currYear, 24), 
            datasets: [{
                label: "Yearly Savings",
                data: data.calculatedData.yearlySavings, 
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
            title: {
                display: true,
                text: 'Skumulowany zwrot z inwestycji na przestrzeni lat'
            }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    return myChart
}

// Cost comparison chart
function createCostComparisonChart(data) {
    const ctx = document.getElementById('costComparisonChart');
    if (!ctx) return;
    
    const d = new Date();
    let currYear = d.getFullYear();
    
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fillArray(currYear, 24),
            datasets: [
                {
                    label: 'Koszty bez PV',
                    data: data.calculatedData.yearlyCostsNoPV,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Koszty z PV',
                    data: data.calculatedData.yearlyCostsPV,
                    borderColor: '#51cf66',
                    backgroundColor: 'rgba(81, 207, 102, 0.1)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            plugins: {
            title: {
                display: true,
                text: 'Porównanie inwestycji NoPv/Pv'
            }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    return myChart
}
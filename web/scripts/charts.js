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

// Generate monthly labels for a specific year
function getMonthlyLabels() {
    return [
        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
}
// =================== END HELPER FUNCTION ===================

// Return on investment yearly
function returnOnInvestment(data, iters){
    const ctx = document.getElementById("returnOnInvestment");
    const d = new Date();
    let currYear = d.getFullYear();
    // console.log(data)
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: fillArray(currYear, iters), 
            datasets: [{
                label: "Roczne oszczędności",
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
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Kwota (PLN)'
                    }
                },
            }
        }
    });
    return myChart
}

// Return on investment hourly
function returnOnInvestmentH(data, selectedYear){
    const ctx = document.getElementById("returnOnInvestmentH");
    const d = new Date();
    let currYear = d.getFullYear();
    
    const yearIndex = selectedYear - currYear;
    
    const startHour = yearIndex * 8760;
    const endHour = startHour + 8760;
    
    const yearlyHourlyData = data.calculatedDataH.hourlySavings.slice(startHour, endHour);
    
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fillArray(1, yearlyHourlyData.length), 
            datasets: [{
                label: "Godzinne ooszczędności",
                data: yearlyHourlyData,
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Godzinowe oszczędności w roku ' + selectedYear
                }
            },
            scales: {
                 y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Kwota (PLN)'
                    }
                },
                x: {
                    ticks: {
                        maxTicksLimit: 12,
                        callback: function(value, index) {
                            const monthNames = getMonthlyLabels();
                            const monthIndex = Math.floor((index / 8760) * 12);
                            return monthIndex < 12 ? monthNames[monthIndex] : '';
                        }
                    }
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
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Kwota (PLN)'
                    }
                },
            }
        }
    });
    return myChart
}

// Cost comparison chart H
function createCostComparisonChartH(data, selectedYear) {
    const ctx = document.getElementById('costComparisonChartH');
    if (!ctx) return;
    
    const d = new Date();
    let currYear = d.getFullYear();
    const yearIndex = selectedYear - currYear;
    
    const startHour = yearIndex * 8760;
    const endHour = startHour + 8760;
    
    const yearlyNoPVData = data.calculatedDataH.hourlyCostsNoPV.slice(startHour, endHour);
    const yearlyPVData = data.calculatedDataH.hourlyCostsPV.slice(startHour, endHour);
    
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fillArray(1, yearlyNoPVData.length), 
            datasets: [
                {
                    label: 'Koszty bez PV',
                    data: yearlyNoPVData,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Koszty z PV',
                    data: yearlyPVData,
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
                text: 'Porównanie inwestycji NoPv/Pv w roku ' + selectedYear
            }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Kwota (PLN)'
                    }
                },
                x: {
                    ticks: {
                        maxTicksLimit: 12,
                        callback: function(value, index) {
                            const monthNames = getMonthlyLabels();
                            const monthIndex = Math.floor((index / 8760) * 12);
                            return monthIndex < 12 ? monthNames[monthIndex] : '';
                        }
                    }
                }
            }
        }
    });
    return myChart
}

function meanEnergyConsumption(){
    const powerPerDay = [
    0.009756097560975611, 0.009756097560975611, 0.007317073170731708, 0.009756097560975611,
    0.02439024390243903, 0.04634146341463415, 0.051219512195121955, 0.04146341463414635,
    0.04146341463414635, 0.03658536585365854, 0.04146341463414635, 0.04634146341463415,
    0.06097560975609757, 0.04878048780487806, 0.034146341463414644, 0.034146341463414644,
    0.034146341463414644, 0.06097560975609757, 0.10975609756097562, 0.0902439024390244,
    0.06097560975609757, 0.04634146341463415, 0.03658536585365854, 0.017073170731707,
    ]

    const ctx = document.getElementById("meanEnergyConsumption");
    // console.log(data)
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({length: 24}, (_, i) => {
            if (i === 0) return '12 AM';
            if (i < 12) return `${i} AM`;
            if (i === 12) return '12 PM';
            return `${i - 12} PM`;
            }), 
            datasets: [{
                label: "Średnie zużycie",
                data: powerPerDay, 
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                borderColor: 'rgb(0, 0, 0)',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
            title: {
                display: true,
                text: 'Średnie zużycie energi przez gospodarstwo domowe w Unii Europejskiej (kWh)'
            }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Zużycie (kWh)'
                    }
                },
            }
        }
    });
    return myChart
}

function reliefInfluence(data, iters){
    const ctx = document.getElementById("reliefInfluence");
    const d = new Date();
    let currYear = d.getFullYear();
    // console.log(data)
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: fillArray(currYear, iters), 
            datasets: [{
                label: "Roczne oszczędności",
                data: data.calculatedData.yearlySavings, 
                borderWidth: 1
            },
            {
                label: "Wpływ ulgi",
                data: data.calculatedData.yearlyReliefSavings,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
            title: {
                display: true,
                text: 'Wpływ ulgi'
            }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Kwota (PLN)'
                    },
                    stacked: true
                },
                x: {
                    stacked: true
                }
            }
        }
    });
    return myChart
}
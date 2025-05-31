//helper functions
function fillArray(low, iters) {
    let a = []
    for (let i = low; i <= low + iters; i++) {
        a.push(i);
    }
    return a;
}

// Creating charts
function createChart(data){
    const ctx = document.getElementById('chart1');
    const d = new Date();
    let currYear = d.getFullYear();
    // console.log(data)
    new Chart(ctx, {
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
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
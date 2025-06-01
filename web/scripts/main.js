class ROICalculator {
    constructor() {
        this.charts = {
            returnOnInvestment: null,
            returnOnInvestmentH : null,
            costComparison: null,
            costComparisonH: null
        };
        this.currentData = null; 
        this.setupEventListeners(); 
    }
    
    setupEventListeners() {
        // Add event listener for year selection
        const yearInput = document.getElementById('yearChoose');
        if (yearInput) {
            yearInput.addEventListener('change', (event) => {
                this.updateHourlyCharts(parseInt(event.target.value));
            });
        }
    }
    
    updateHourlyCharts(selectedYear) {
        if (!this.currentData) {
            console.log('No data available to update charts');
            return;
        }
        
        if (this.charts.returnOnInvestmentH) {
            this.charts.returnOnInvestmentH.destroy();
            this.charts.returnOnInvestmentH = null;
        }
        
        if (this.charts.costComparisonH) {
            this.charts.costComparisonH.destroy();
            this.charts.costComparisonH = null;
        }
        
        this.charts.returnOnInvestmentH = returnOnInvestmentH(this.currentData, selectedYear);
        this.charts.costComparisonH = createCostComparisonChartH(this.currentData, selectedYear);
    }
    
    async submit() {
        try {
            if (!validateInputs()) {
                console.log('Please fill in all required fields');
                return;
            }
            
            const formData = getFormData();
            
            const response = await submitData(formData)
            this.processResponse(response);           
        } catch (error) {
            console.error('Submission error:', error);
            alert('Wystąpił błąd podczas obliczania. Spróbuj ponownie.');
        }
    }
    
    processResponse(data) {
        this.currentData = data;
        
        this.destroyCharts();

        this.createROILabel(data);
        
        const yearInput = document.getElementById('yearChoose');
        const selectedYear = yearInput ? parseInt(yearInput.value) : 2025;

        this.charts.returnOnInvestment = returnOnInvestment(data, data.calculatedData.yearlySavings.length - 1);
        this.charts.returnOnInvestmentH = returnOnInvestmentH(data, selectedYear);
        this.charts.costComparison = createCostComparisonChart(data);
        this.charts.costComparisonH = createCostComparisonChartH(data, selectedYear);
    }

    destroyCharts(){
        if (this.charts.returnOnInvestment) {
            this.charts.returnOnInvestment.destroy();
            this.charts.returnOnInvestment = null;
        }
        
        if (this.charts.costComparison) {
            this.charts.costComparison.destroy();
            this.charts.costComparison = null;
        }

        if (this.charts.returnOnInvestmentH) {
            this.charts.returnOnInvestmentH.destroy(); 
            this.charts.returnOnInvestmentH = null;
        }

        if (this.charts.costComparisonH) {
            this.charts.costComparisonH.destroy();
            this.charts.costComparisonH = null;
        }
    }

    createROILabel(data) {
        const ROIPositive = document.getElementById("ROIPositive");
        const ROINegative = document.getElementById("ROINegative");
        
        ROIPositive.style.display = "none";
        ROINegative.style.display = "none";
        
        const cumulativeSavings = data.calculatedData.yearlySavings;
        let positiveROIYear = null;

        for (let i = 0; i < cumulativeSavings.length; i++) {
            if (cumulativeSavings[i] > 0) {
                positiveROIYear = i + 1; 
                break;
            }
        }

        if (positiveROIYear) {
            document.getElementById("ROIYears").textContent = positiveROIYear;
            
            const yearsLabel = document.getElementById("ROIYearsLabel");
            if (positiveROIYear === 1) {
                yearsLabel.textContent = "roku";
            } else if (positiveROIYear < 5) {
                yearsLabel.textContent = "latach";
            } else {
                yearsLabel.textContent = "latach";
            }
            
            ROIPositive.style.display = "block";
            
            setTimeout(() => {
                ROIPositive.classList.add('show');
            }, 100);
        } else {
            ROINegative.style.display = "block";
            
            setTimeout(() => {
                ROINegative.classList.add('show');
            }, 100);
        }
    }
}

const calculator = new ROICalculator();

function submit() {
    calculator.submit();
}
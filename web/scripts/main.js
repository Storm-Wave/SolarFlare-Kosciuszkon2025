// Main application logic
class ROICalculator {
    constructor() {
        this.charts = {
            returnOnInvestment: null,
            returnOnInvestmentH : null,
            costComparison: null,
            costComparisonH: null
        };
    }
    
    async submit() {
        try {
            // Validate inputs
            if (!validateInputs()) {
                console.log('Please fill in all required fields');
                return;
            }
            
            // Get form data
            const formData = getFormData();
            
            // Submit to API
            const response = await submitData(formData)
            this.processResponse(response);           
        } catch (error) {
            console.error('Submission error:', error);
            alert('Wystąpił błąd podczas obliczania. Spróbuj ponownie.');
        }
    }
    
    processResponse(data) {
        this.destroyCharts();

        // create ROI info
        this.createROILabel(data);

        // Create charts
        this.charts.returnOnInvestment = returnOnInvestment(data, data.calculatedData.yearlySavings.length - 1);
        this.charts.returnOnInvestmentH = returnOnInvestmentH(data, data.calculatedDataH.hourlySavings.length - 1);
        this.charts.costComparison = createCostComparisonChart(data);
        this.charts.costComparisonH = createCostComparisonChartH(data);
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
            this.charts.returnOnInvestment.destroy();
            this.charts.returnOnInvestment = null;
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

// Initialize application
const calculator = new ROICalculator();

// Global submit function (called from HTML)
function submit() {
    calculator.submit();
}
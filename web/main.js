// Main application logic
class ROICalculator {
    constructor() {
        this.charts = {
            returnOnInvestment: null,
            costComparison: null
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
        // Create charts
        this.charts.returnOnInvestment = returnOnInvestment(data);
        this.charts.costComparison = createCostComparisonChart(data);
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
    }
}

// Initialize application
const calculator = new ROICalculator();

// Global submit function (called from HTML)
function submit() {
    calculator.submit();
}
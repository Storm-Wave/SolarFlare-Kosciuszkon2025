// Main application logic
class ROICalculator {
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
            const response = await submitData(formData);
            
            // Process response and create visualizations
            // this.processResponse(response);
            
        } catch (error) {
            console.error('Submission error:', error);
            alert('Wystąpił błąd podczas obliczania. Spróbuj ponownie.');
        }
    }
    
    processResponse(data) {
        // Clear existing charts
        this.clearCharts();
        
        // Create results section if it doesn't exist
        this.createResultsSection();
        
        // Update metrics
        this.metricsManager.updateMetrics(data);
        
        // Create charts
        this.createAllCharts(data);
    }
}

// Initialize application
const calculator = new ROICalculator();

// Global submit function (called from HTML)
function submit() {
    calculator.submit();
}
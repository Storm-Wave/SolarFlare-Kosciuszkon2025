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
            const response = await submitData(formData)
            this.processResponse(response);           
        } catch (error) {
            console.error('Submission error:', error);
            alert('Wystąpił błąd podczas obliczania. Spróbuj ponownie.');
        }
    }
    
    processResponse(data) {
        // Create charts
        createChart(data);
    }
}

// Initialize application
const calculator = new ROICalculator();

// Global submit function (called from HTML)
function submit() {
    calculator.submit();
}
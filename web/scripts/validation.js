// Helper function to add error class to input group
function setInputGroupError(inputId) {
    const input = document.getElementById(inputId);
    const inputGroup = input.closest('.input-group');
    inputGroup.classList.add('error');
}

// Helper function to clear all errors
function clearAllErrors() {
    const inputGroups = document.querySelectorAll('.input-group');
    inputGroups.forEach(group => {
        group.classList.remove('error');
    });
}

// Validation function
function validateInputs() {
    clearAllErrors();
    
    const fields = [
        'consumption', 'buyPrice', 'pvSize',
        'sellPrice', 'pvCostPerKw', 'panelwear', 'priceIncrease', 'longtitude', 'latitude'
    ];
    
    let hasErrors = false;
    
    fields.forEach(fieldId => {
        const value = document.getElementById(fieldId).value;
        if (!value || isNaN(parseFloat(value))) {
            setInputGroupError(fieldId);
            hasErrors = true;
        }
    });
    
    return !hasErrors;
}
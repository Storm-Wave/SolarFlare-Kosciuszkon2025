// Update toggle on coordinate selection
function toggleLocationMode(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const manualInput = document.getElementById('manualInput');
    const mapContainer = document.getElementById('mapContainer');
    
    if (mode === 'manual') {
        manualInput.style.display = 'grid';
        mapContainer.classList.remove('active');
    } else {
        manualInput.style.display = 'none';
        mapContainer.classList.add('active');
        // initializeMap();
        initMap();
    }
}

function setCoordinates(lat, lng){
    const coords = document.getElementById("coordsDisplay");
    const manualLat = document.getElementById("latitude");
    const manualLng = document.getElementById("longtitude");

    coords.innerHTML = "Szerokość: " + lat +"°, " + "Długość: " + lng;
    manualLat.value = lat;
    manualLng.value = lng;

}


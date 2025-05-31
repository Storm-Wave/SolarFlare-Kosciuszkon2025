async function initMap() {
    // Wait for the gmp-map element to be ready
    await customElements.whenDefined('gmp-map');
    
    const mapElement = document.querySelector('gmp-map');
    const { Map } = await google.maps.importLibrary("maps");
    const { PlacesService } = await google.maps.importLibrary("places");
    
    // Get the map instance from the gmp-map element
    const map = mapElement.innerMap;
    
    const input = document.getElementById("pac-input");
    const autocomplete = new google.maps.places.Autocomplete(input, {
        fields: ["place_id", "geometry", "formatted_address", "name"],
    });

    autocomplete.bindTo("bounds", map);
    
    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");
    infowindow.setContent(infowindowContent);

    const marker = new google.maps.Marker({ map: map });

    marker.addListener("click", () => {
        infowindow.open(map, marker);
    });

    autocomplete.addListener("place_changed", () => {
        infowindow.close();
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        marker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location,
        });
        marker.setVisible(true);
        
        infowindowContent.children.namedItem("place-name").textContent = place.name;
        infowindowContent.children.namedItem("place-id").textContent = place.place_id;
        infowindowContent.children.namedItem("place-address").textContent = place.formatted_address;
        
        infowindow.open(map, marker);
    });
}
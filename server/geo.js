// Import node-fetch for HTTP requests (ensure node-fetch v2 is installed for CommonJS support)
const fetch = require('node-fetch');

/**
 * Fetches hourly solar PV power output data from Renewables.ninja API
 *
 * @param {Object} options - Options object
 * @param {number} options.lat - Latitude coordinate (decimal degrees)
 * @param {number} options.lon - Longitude coordinate (decimal degrees)
 * @param {string} options.dateFrom - Start date (YYYY-MM-DD)
 * @param {string} options.dateTo - End date (YYYY-MM-DD)
 * @param {number} [options.capacity] - Installed PV capacity in kW
 * @param {number} [options.systemLoss=0.1] - System losses as a fraction (e.g., 0.1 = 10%)
 * @param {number} [options.tracking=0] - Tracking mode (0 = fixed, 1 = single axis, 2 = dual axis)
 * @param {number} [options.tilt=35] - PV tilt angle in degrees
 * @param {number} [options.azim=180] - PV azimuth angle in degrees (0 = north, 180 = south)
 * @param {string} [options.dataset='merra2'] - Dataset to use ('merra2' or 'cfsr')
 * @param {string} options.token - API authorization token
 *
 * @returns {Promise<Object|null>} Resolves to API data object or null if an error occurs
 */
async function fetchSolarData({
  lat,
  lon,
  dateFrom,
  dateTo,
  capacity,
  systemLoss = 0.1,
  tracking = 2,
  tilt = 35,
  azim = 180,
  dataset = 'merra2',
  token
}) {
  // Base URL for Renewables.ninja PV API
  const url = 'https://www.renewables.ninja/api/data/pv';
  // Construct URL query parameters
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    date_from: dateFrom,
    date_to: dateTo,
    dataset,
    capacity: capacity.toString(),
    system_loss: systemLoss.toString(),
    tracking: tracking.toString(),
    tilt: tilt.toString(),
    azim: azim.toString(),
    format: 'json',
    header: 'true'
  });

  try {
    // Make GET request with authorization header
    const response = await fetch(`${url}?${params.toString()}`, {
      headers: {
        Authorization: `Token ${token}`
      }
    });

    // Check if response status indicates success
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    // Parse JSON response body
    const data = await response.json();

    // Return relevant data (hourly power output)
    return data.data;
  } catch (error) {
    // Log error message to console
    console.error('Error fetching solar data:', error.message);
    // Return null on failure
    return null;
  }
}

module.exports = {
  fetchSolarData
};

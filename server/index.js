// ---------------------------
// Imports & Configuration
// ---------------------------

const express = require("express");
const bodyParser = require("body-parser");
const { createEntryData } = require("./entryData.js");
const { calculateYearlyReturn } = require("./calc.js");
const { fetchSolarData } = require("./geo.js");
const app = express();
const PORT = 3000;

// ---------------------------
// Middleware Setup
// ---------------------------

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("web"));

// ---------------------------
// Helper: Timestamped Logger
// ---------------------------

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// ---------------------------
// Routes
// ---------------------------

/**
 * POST /submit
 * Receives and logs form submission data
 */
app.post("/submit", (req, res) => {
  try {
    const entryData = createEntryData(req);

    log(`Received /submit request`);
    for (const [key, value] of Object.entries(entryData)) {
      log(`  ${key}: ${value}`);
    }
    log(`End of /submit request`);
   
    // Example usage
    (async () => {
        const token = '2d14569a6e0c2d68529688d25e8d18e468ebb66d'; // Replace with your actual API token
        const lat = 52.23; // Latitude for Warsaw
        const lon = 21.01; // Longitude for Warsaw
        const dateFrom = '2019-01-01';
        const dateTo = '2024-12-31';
        const capacity = entryData.pvSize;

        const solarData = await fetchSolarData({
            lat,
            lon,
            dateFrom,
            dateTo,
            capacity,
            token
        });

        if (solarData) {
            console.log('Hourly Solar Data:', solarData);
        }
    })().then(()=>{
        const calculatedData = calculateYearlyReturn(entryData);

        res.status(200).json({
          message: "Data received and calculated successfully",
          calculatedData: {
            yearlySavings: calculatedData.yearlySavings,
            yearlyCostsNoPV: calculatedData.yearlyCostsNoPV,
            yearlyCostsPV: calculatedData.yearlyCostsPV,
          }
        });
        log(`Sent calculated data`);
        for (const [key, value] of Object.entries(calculatedData)) {
          log(`  ${key}: ${value}`);
        }
        log(`End of sent calculated data`);
    });
  } catch (error) {
    log(`Error in /submit: ${error.message}`);
    res.status(400).json({ message: "Invalid data format or request body." });
  }
});

// ---------------------------
// Start Server
// ---------------------------

app.listen(PORT, () => {
  log(`Server started on http://localhost:${PORT}`);
});

// ---------------------------
// Imports & Configuration
// ---------------------------

const express = require("express");
const bodyParser = require("body-parser");
const { createEntryData } = require("./entryData.js");
const { calculateYearlyReturn } = require("./calc.js");
const { fetchSolarData } = require("./geo.js");
const fs = require('fs');
const path = require('path');
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

/**
 * Konwertuje Unix timestamp do formatu ISO (YYYY-MM-DD).
 * @param {string} unixTimestamp
 * @returns {string} sformatowana data
 */
function formatUnixToDate(unixTimestamp) {
    const date = new Date(parseInt(unixTimestamp) * 1000); // Unix timestamp w sekundach
    return date; // Zwraca tylko YYYY-MM-DD
}

/**
 * Zapisuje dane JSON (z datą w formacie Unix timestamp) do pliku CSV.
 * @param {Array<{date: string, value: number}>} data - Dane wejściowe.
 * @param {string} outputFile - Ścieżka do pliku wynikowego CSV.
 */
function saveJsonToCsv(data, outputFile = 'dane.csv') {
    console.log(data);
    if (!Array.isArray(data) || data.length === 0) {
        console.error('Brak danych do zapisania.');
        return;
    }

    const headers = 'date,value';
    const rows = data.map(item => {
        const formattedDate = formatUnixToDate(item.date);
        return `${formattedDate},${item.value}`;
    });

    const csvContent = [headers, ...rows].join('\n');

    fs.writeFileSync(path.resolve(outputFile), csvContent, 'utf8');
    console.log(`Dane zapisane do pliku: ${outputFile}`);
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
      log(`${key}: ${value}`);
    }
    log(`End of /submit request`);
   
    // Example usage
    (async () => {
        const token = '2d14569a6e0c2d68529688d25e8d18e468ebb66d';
        const lat = entryData.latitude; // Latitude for Warsaw
        const lon = entryData.longtitude; // Longitude for Warsaw
        const dateFrom = '2024-01-01';
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
            const arrayData = Object.entries(solarData).map(([timestamp, data]) => [Number(timestamp), data.electricity]);
            saveJsonToCsv(Object.values(arrayData));
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

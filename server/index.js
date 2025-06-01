// ---------------------------
// Imports & Configuration
// ---------------------------

const express = require("express");
const bodyParser = require("body-parser");
const { createEntryData } = require("./entryData.js");
const { hourlyReturn, yearlyReturn } = require("./calc.js");
const { fetchSolarData } = require("./geo.js");
const fs = require('fs');
const { spawn } = require('child_process');
const app = express();
const { powerPerDay } = require("./powerPerDay.js");
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
 * Zapisuje dane JSON (z datą w formacie Unix timestamp) do pliku CSV.
 * @param {Array<{date: number, value: number}>} data - Dane wejściowe.
 * @param {string} outputFile - Ścieżka do pliku wynikowego CSV.
 */
function saveJsonToCsv(data, outputFile = 'dane.csv') {
    if (!Array.isArray(data) || data.length === 0) {
        console.error('Brak danych do zapisania.');
        return;
    }

    const csvHeader = 'datetime,value\n';
    const csvRows = data.map(([timestamp, electricity]) => `${timestamp.toISOString().split('.')[0]},${electricity}`).join('\n');
    const csvContent = csvHeader + csvRows;
    // Write to file
    fs.writeFile(outputFile, csvContent, 'utf8', (err) => {
      if (err) {
        console.error('Error writing CSV file:', err);
      } else {
        log(`CSV file saved as ${outputFile}`);
      }
    });
}


function csvToSun(path) {
    const csvData = fs.readFileSync(path, 'utf8');

    // Split into lines and remove the header (first line)
    const lines = csvData.trim().split('\n').slice(1);

    // Parse values into an array
    const values = lines.map(line => {
        const parts = line.split(',');
        return parseFloat(parts[1]);
    });
    return values;
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
        const lat = entryData.latitude;
        const lon = entryData.longtitude;
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

        if(solarData) {
            const arrayData = Object.entries(solarData).map(([timestamp, data]) => [new Date(parseInt(timestamp)), data.electricity]);
            saveJsonToCsv(Object.values(arrayData));
        }
    })().then(()=>{
        const python = spawn('python', ["./models/predictProduction.py", "./dane.csv", entryData.longtitude, entryData.latitude]);
        python.on('close', (_) => {
            let test1 = Array(25*356*24);
            let test2 = Array(25*365*24);
            test1[0] = entryData.buyPrice;
            test2[0] = entryData.sellPrice;
            for(let j = 1; j < 25*365*24; j++) {
                test1[j] = test1[j-1];
                test2[j] = test2[j-1];
                if(j%(24*365) == 0) {
                    test1[j]+=test1[j]*entryData.priceIncrease;
                    test2[j]+=test2[j]*entryData.priceIncrease;
                }
            }

            const calculatedDataH = hourlyReturn(entryData, csvToSun("./prognoza_25_lat.csv"), test1, test2, powerPerDay);
            const calculatedData = yearlyReturn(calculatedDataH);
            res.status(200).json({
              message: "Data received and calculated successfully",
              calculatedDataH: {
                hourlySavings: calculatedDataH.hourlySavings,
                hourlyCostsNoPV: calculatedDataH.hourlyCostsNoPV,
                hourlyCostsPV: calculatedDataH.hourlyCostsPV
              },
              calculatedData: {
                yearlySavings: calculatedData.yearlySavings,
                yearlyCostsNoPV: calculatedData.yearlyCostsNoPV,
                yearlyCostsPV: calculatedData.yearlyCostsPV
              }
            });
            log(`Sent calculated data`);
            for (const [key, value] of Object.entries(calculatedData)) {
                log(`  ${key}: ${value}`);
            }
            log(`End of sent calculated data`);
        });
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

// ---------------------------
// Imports & Configuration
// ---------------------------

const express = require("express");
const bodyParser = require("body-parser");
const { createEntryData } = require("./entry.js");

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

    res.status(200).json({ message: "Data received successfully" });
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

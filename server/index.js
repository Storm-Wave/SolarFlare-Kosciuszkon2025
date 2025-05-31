const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Route to handle form submission
app.post('/submit', (req, res) => {
  // Access the form data from req.body
  const { name, email } = req.body;
  console.log('Received data:', { name, email });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});


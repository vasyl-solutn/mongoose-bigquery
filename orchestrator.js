// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Create an Express application
const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.post('/run', async (req, res) => {
  const YEARS_PORTION = 6;
  let limit = req.query.limit || YEARS_PORTION;
  console.log({ limit })

  while (limit > 0) {
    const getLimit = Math.min([limit, YEARS_PORTION])
    limit -= getLimit;
    // select portion years
    // get /data to bigquery for each year
      // save year to mongo
  }
});

// Start the server
const PORT = process.env.ORCHESTRATOR_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Orchestrator Server is running on port ${PORT}`);
});

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

// Create an Express application
const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/run', async (req, res) => {
  const YEARS_PORTION = 6;
  let limit = req.query.limit || YEARS_PORTION;
  console.log({ limit });

  try {
    while (limit > 0) {
      const getLimit = Math.min(limit, YEARS_PORTION);
      limit -= getLimit;

      // Fetch unprocessed years from /year-item endpoint
      const yearResponse = await axios.get(`http://localhost:${process.env.PORT}/year-item?limit=${getLimit}`);
      const yearsToProcess = yearResponse.data;

      if (yearsToProcess.length === 0) {
        console.log('No unprocessed years available.');
        break;
      }

      for (const year of yearsToProcess) {
        console.log(`Processing data for year ${year}...`);
        try {
          // Fetch data from BigQuery and store in MongoDB
          await axios.get(`http://localhost:${process.env.BIG_QUERY_APP_PORT}/data/${year}`);

          // Mark the year as processed by saving it to /year-item
          await axios.post(`http://localhost:${process.env.PORT}/year-item`, { year });

          console.log(`Year ${year} processed and saved.`);
        } catch (error) {
          console.error(`Error processing year ${year}:`, error.message);
        }
      }
    }

    res.status(200).send('Data processing completed.');
  } catch (error) {
    console.error('Error during /run operation:', error.message);
    res.status(500).send('An error occurred during processing.');
  }
});

const PORT = process.env.ORCHESTRATOR_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Orchestrator Server is running on port ${PORT}`);
});

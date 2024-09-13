const express = require('express');
const { BigQuery } = require('@google-cloud/bigquery');
const axios = require('axios')

require('dotenv').config();

const app = express();

// Set up BigQuery client
const bigquery = new BigQuery({
  // projectId: process.env.GCP_PROJECT_ID,
  keyFilename: `./sa-files/${process.env.SA_FILE}.json`
});

app.get('/data', async (req, res) => {
  const query = `
    SELECT name, year, gender, number
    FROM \`bigquery-public-data.usa_names.usa_1910_2013\`
    LIMIT 10
  `;

  try {
    const [rows] = await bigquery.query(query);
    // TODO: re-use here async all
    rows.forEach(async item => {
      try {
        await axios.post(`http://localhost:${process.env.PORT}/items`, {
          name: item.name,
          year: item.year,
          gender: item.gender,
          quantity: item.number
        })
        console.log('created: ', item)
      } catch (err) {
        console.error(err)
      }
    })
    res.json(rows);
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).send('Something went wrong!');
  }
});

app.listen(process.env.BIG_QUERY_APP_PORT, () => {
  console.log(`Express app listening at http://localhost:${process.env.BIG_QUERY_APP_PORT}`);
});

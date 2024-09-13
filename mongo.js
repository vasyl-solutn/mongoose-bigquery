// Import required modules
const express = require('express');
const mongoose = require('mongoose');
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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

// Define a Mongoose schema and model with validation and indexing
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

itemSchema.index({ name: 1, year: 1, gender: 1 }, { unique: true }); // Indexing for faster queries

const Item = mongoose.model('Item', itemSchema);

// Routes
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find().limit(100); // Limit results for performance
    res.json(items);
  } catch (err) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.post('/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).send({ error: 'Bad Request', details: err.message });
  }
});

app.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) {
      return res.status(404).send({ error: 'Item not found' })
    }
    res.json(item);
  } catch (err) {
    console.error(err)
    res.status(500).send({error: 'Internal Server Error'});
  }
})

app.put('/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedItem) {
      return res.status(404).send({ error: 'Item not found' });
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(400).send({ error: 'Bad Request', details: err.message });
  }
});

app.delete('/items/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).send({ error: 'Item not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

const YearItem = require('./year-item');

// Endpoint to post year item
app.post('/year-item', async (req, res) => {
  try {
    const { year } = req.body;
    const newItem = new YearItem({ year });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).send({ error: 'Internal Server Error', details: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

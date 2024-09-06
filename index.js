require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

let apiKey = process.env.SHOPIFY_API_KEY;
let password = process.env.SHOPIFY_PASSWORD;
let shopDomain = process.env.SHOP_DOMAIN;
let apiVersion = '2024-07';  // Adjust this if needed

// Base URLs for Shopify resources
const baseUrl = `https://${apiKey}:${password}@${shopDomain}/admin/api/${apiVersion}`;

// Customers Route
app.all('/customers/:id?', async (req, res) => {
  const { id } = req.params;
  const url = id ? `${baseUrl}/customers/${id}.json` : `${baseUrl}/customers.json`;

  try {
    let response;
    switch (req.method) {
      case 'GET':
        response = await axios.get(url);
        break;
      case 'POST':
        response = await axios.post(url, { customer: req.body });
        break;
      case 'PUT':
        if (!id) return res.status(400).send('Customer ID is required for updates');
        response = await axios.put(url, { customer: req.body });
        break;
      case 'DELETE':
        if (!id) return res.status(400).send('Customer ID is required for deletion');
        response = await axios.delete(url);
        break;
      default:
        return res.status(405).send('Method not allowed');
    }
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

// Orders Route
app.all('/orders/:id?', async (req, res) => {
  const { id } = req.params;
  const url = id ? `${baseUrl}/orders/${id}.json` : `${baseUrl}/orders.json`;

  try {
    let response;
    switch (req.method) {
      case 'GET':
        response = await axios.get(url);
        break;
      case 'POST':
        response = await axios.post(url, { order: req.body });
        break;
      case 'PUT':
        if (!id) return res.status(400).send('Order ID is required for updates');
        response = await axios.put(url, { order: req.body });
        break;
      case 'DELETE':
        if (!id) return res.status(400).send('Order ID is required for deletion');
        response = await axios.delete(url);
        break;
      default:
        return res.status(405).send('Method not allowed');
    }
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});


// Products Route (GET only)
app.get('/products/:id?', async (req, res) => {
    const { id } = req.params;
    const url = id ? `${baseUrl}/products/${id}.json` : `${baseUrl}/products.json`;
  
    try {
      const response = await axios.get(url);
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error('Error:', error.message);
      res.status(error.response ? error.response.status : 500).send(error.message);
    }
  });
  
// Start the server
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


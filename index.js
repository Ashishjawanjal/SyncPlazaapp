const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json()); // To parse JSON bodies

const port = process.env.PORT || 3006;

const shopifyHeaders = {
    'X-Shopify-Access-Token': process.env.SHOPIFY_PASSWORD,
    'Content-Type': 'application/json'
};

const baseUrl = `https://${process.env.SHOP_DOMAIN}/admin/api/2023-04`;

// Authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1]; // Assuming the format is "Bearer token"

    if (token !== process.env.API_ACCESS_TOKEN) {
        return res.status(403).json({ error: 'Invalid access token' });
    }

    next(); // Token is valid, proceed to the next middleware or route handler
};

// Apply authentication middleware to all API routes
app.use('/api', authenticate);

// Base URL for all Shopify-related routes
app.use('/api', (req, res, next) => {
    res.locals.baseUrl = baseUrl;
    next();
});

// Fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const response = await axios.get(`${res.locals.baseUrl}/products.json`, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch a single product
app.get('/api/products/:productId', async (req, res) => {
  const { productId } = req.params; 
  try {
      // Fetch product details
      const productResponse = await axios.get(`${res.locals.baseUrl}/products/${productId}.json`, {
          headers: shopifyHeaders
      });

      // Fetch metafields for the product
      const metafieldsResponse = await axios.get(`${res.locals.baseUrl}/products/${productId}/metafields.json`, {
          headers: shopifyHeaders
      });

      // Filter out only custom metafields
      const customMetafields = metafieldsResponse.data.metafields.filter(metafield => {
          return metafield.namespace === 'custom'; // Replace 'custom' with your actual namespace or condition
      });

      const product = productResponse.data.product;
      product.metafields = customMetafields; // Add only custom metafields to the product object

      res.status(200).json(product);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Fetch all orders
app.get('/api/orders', async (req, res) => {
    try {
        const response = await axios.get(`${res.locals.baseUrl}/orders.json`, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch a single order
app.get('/api/orders/:orderId', async (req, res) => {
    const { orderId } = req.params;
    try {
        const response = await axios.get(`${res.locals.baseUrl}/orders/${orderId}.json`, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all customers
app.get('/api/customers', async (req, res) => {
    try {
        const response = await axios.get(`${res.locals.baseUrl}/customers.json`, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch a single customer
app.get('/api/customers/:customerId', async (req, res) => {
    const { customerId } = req.params;
    try {
        const response = await axios.get(`${res.locals.baseUrl}/customers/${customerId}.json`, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new customer
app.post('/api/customers', async (req, res) => {
    const customerData = req.body;
    try {
        const response = await axios.post(`${res.locals.baseUrl}/customers.json`, { customer: customerData }, {
            headers: shopifyHeaders
        });
        res.status(201).json(response.data.customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a customer
app.put('/api/customers/:customerId', async (req, res) => {
    const { customerId } = req.params;
    const customerData = req.body;
    try {
        const response = await axios.put(`${res.locals.baseUrl}/customers/${customerId}.json`, { customer: customerData }, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a customer
app.delete('/api/customers/:customerId', async (req, res) => {
    const { customerId } = req.params;
    try {
        await axios.delete(`${res.locals.baseUrl}/customers/${customerId}.json`, {
            headers: shopifyHeaders
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new order
app.post('/api/orders', async (req, res) => {
    const orderData = req.body;
    try {
        const response = await axios.post(`${res.locals.baseUrl}/orders.json`, { order: orderData }, {
            headers: shopifyHeaders
        });
        res.status(201).json(response.data.order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an order
app.put('/api/orders/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const orderData = req.body;
    try {
        const response = await axios.put(`${res.locals.baseUrl}/orders/${orderId}.json`, { order: orderData }, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an order
app.delete('/api/orders/:orderId', async (req, res) => {
    const { orderId } = req.params;
    try {
        await axios.delete(`${res.locals.baseUrl}/orders/${orderId}.json`, {
            headers: shopifyHeaders
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all metafields for a specific product
app.get('/api/products/:productId/metafields', async (req, res) => {
  const { productId } = req.params;
  try {
      const response = await axios.get(`${res.locals.baseUrl}/products/${productId}/metafields.json`, {
          headers: shopifyHeaders
      });

      // Filter out only custom metafields
      const customMetafields = response.data.metafields.filter(metafield => {
          return metafield.namespace === 'custom'; // Replace 'custom' with your actual namespace or condition
      });

      res.status(200).json(customMetafields);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Fetch all collections
app.get('/api/collections', async (req, res) => {
    try {
        const response = await axios.get(`${res.locals.baseUrl}/custom_collections.json`, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.custom_collections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch a single collection by ID
app.get('/api/collections/:collectionId', async (req, res) => {
    const { collectionId } = req.params;
    try {
        const response = await axios.get(`${res.locals.baseUrl}/custom_collections/${collectionId}.json`, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.custom_collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all pages
app.get('/api/pages', async (req, res) => {
    try {
        const response = await axios.get(`${res.locals.baseUrl}/pages.json`, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.pages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch a single page by ID
app.get('/api/pages/:pageId', async (req, res) => {
    const { pageId } = req.params;
    try {
        const response = await axios.get(`${res.locals.baseUrl}/pages/${pageId}.json`, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all blogs
app.get('/api/blogs', async (req, res) => {
    try {
        const response = await axios.get(`${res.locals.baseUrl}/blogs.json`, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch a single blog by ID
app.get('/api/blogs/:blogId', async (req, res) => {
    const { blogId } = req.params;
    try {
        const response = await axios.get(`${res.locals.baseUrl}/blogs/${blogId}.json`, {
            headers: shopifyHeaders
        });
        res.status(200).json(response.data.blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

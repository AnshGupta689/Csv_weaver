// Import required libraries
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config(); 

// --- 1. Initial Setup ---
const app = express();
const PORT = process.env.PORT || 5000; 

// --- 2. Middleware (FIX: Increased Body Size Limit) ---
app.use(cors()); 

// Set payload limit for JSON requests (e.g., to 50MB)
app.use(express.json({ limit: '50mb' })); 
// Set payload limit for URL-encoded requests (good practice)
app.use(express.urlencoded({ limit: '50mb', extended: true })); 

// --- 3. PostgreSQL Connection ---
// This uses the correct DB_PORT=5433 and DB_NAME=csv_weaver1 from your .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database. CHECK .env FILE AND PG SERVICE.', err.stack);
  } else {
    console.log('Database connected successfully!');
  }
});

// --- 4. API Endpoint for Uploading Data (FLEXIBLE) ---
app.post('/api/upload', async (req, res) => {
  // We now expect an array of full, unstructured JSON objects
  const records = req.body; 

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'No record data provided or invalid format.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // The query targets the new 'flexible_data' table
    // It inserts 'record_age' (optional) and the entire rest of the record into 'data_json'
    const queryText = `
      INSERT INTO public.flexible_data (record_age, data_json)
      VALUES ($1, $2)
    `;

    for (const record of records) {
      // Safely extract 'age' if it exists for the report column
      const ageValue = record.age || null;
      
      // Ensure 'age' is not part of the final JSON blob, but keep the rest
      const dataJson = JSON.parse(JSON.stringify(record));
      if (dataJson.age !== undefined) {
          delete dataJson.age;
      }
      
      const values = [
        ageValue,           // Stored in the dedicated 'record_age' column (can be null)
        dataJson            // Stores everything else (names, addresses, custom fields) as JSONB
      ];
      
      await client.query(queryText, values);
    }

    await client.query('COMMIT');
    
    res.status(201).json({ message: `Successfully inserted ${records.length} records.` });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during database insertion:', error);
    res.status(500).json({ error: 'An error occurred while inserting data.', details: error.message });
  } finally {
    client.release();
  }
});

// --- 5. Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

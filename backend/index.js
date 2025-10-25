 
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config(); 

 
const app = express();
const PORT = process.env.PORT || 5000; 

 
app.use(cors()); 

 
app.use(express.json({ limit: '50mb' })); 
 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 

 
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

 
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database. CHECK .env FILE AND PG SERVICE.', err.stack);
  } else {
    console.log('Database connected successfully!');
  }
});

 
app.post('/api/upload', async (req, res) => {
 
  const records = req.body; 

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'No record data provided or invalid format.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

   
    const queryText = `
      INSERT INTO public.flexible_data (record_age, data_json)
      VALUES ($1, $2)
    `;

    for (const record of records) {
 
      const ageValue = record.age || null;
      
   
      const dataJson = JSON.parse(JSON.stringify(record));
      if (dataJson.age !== undefined) {
          delete dataJson.age;
      }
      
      const values = [
        ageValue,           
        dataJson            
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

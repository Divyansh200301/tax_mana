const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 5502; // Change this to your desired port


    // MySQL connection
    const db = mysql.createConnection({
        host: '10.3.126.28',
        user: 'Divyansh',
        password: '1234',
        database: 'DEVDAS'
    });

   // Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Middleware to parse JSON data
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Handle POST request to register a new user
app.post('/register', (req, res) => {
  const { panNumber, aadharNumber, fullName, locality } = req.body;

  // Insert user data into MySQL database
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      res.status(500).send('Database connection error');
      return;
    }

    const sql = 'INSERT INTO users (pan_number, aadhar_number, full_name, locality) VALUES (?, ?, ?, ?)';
    const values = [panNumber, aadharNumber, fullName, locality];

    connection.query(sql, values, (err, result) => {
      connection.release(); // Release the connection

      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).send('Failed to register user');
        return;
      }

      console.log('User registered successfully');
      res.status(200).send('User registered successfully');
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

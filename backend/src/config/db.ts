import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'license_system',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully!');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Error connecting to database:', err.message);
    // Exit process if DB connection fails on startup? Or handle differently?
    // process.exit(1);
  });

export default pool;

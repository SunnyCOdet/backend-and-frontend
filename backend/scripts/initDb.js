// Basic script to create tables if they don't exist.
// Run this manually with `node scripts/initDb.js` after setting up .env
// For production, consider using migration tools like TypeORM migrations, Sequelize migrations, or Knex migrations.

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') }); // Ensure correct .env path

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'license_system',
  port: parseInt(process.env.DB_PORT || '3306', 10),
};

const createTablesQueries = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS licenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    license_key VARCHAR(255) NOT NULL UNIQUE,
    hwid VARCHAR(255) NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );`
];

async function initializeDatabase() {
  let connection;
  try {
    // Connect without specifying the database initially to create it if it doesn't exist
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
    });

    console.log(`Ensuring database '${dbConfig.database}' exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    console.log(`Database '${dbConfig.database}' ensured.`);
    await connection.end(); // Close initial connection

    // Reconnect, this time specifying the database
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database. Creating tables...');

    for (const query of createTablesQueries) {
      await connection.query(query);
      console.log(`Executed: ${query.substring(0, 50)}...`);
    }

    console.log('Database tables created or already exist.');

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1); // Exit with error
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

initializeDatabase();

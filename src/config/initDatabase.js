require('dotenv').config();

const mysql = require('mysql2/promise');

async function initializeDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('Connected to MySQL server.');

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`
       CHARACTER SET utf8mb4
       COLLATE utf8mb4_unicode_ci`
    );

    console.log(`Database "${process.env.DB_NAME}" is ready.`);

    await connection.query(
      `USE \`${process.env.DB_NAME}\``
    );

    await connection.query(`
      CREATE TABLE IF NOT EXISTS licenses (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        email VARCHAR(255) NOT NULL,
        google_name VARCHAR(255) NULL,

        college_name VARCHAR(255) NULL,

        status ENUM('pending', 'active', 'suspended')
          NOT NULL DEFAULT 'pending',

        device_id VARCHAR(255) NULL,

        last_check_at DATETIME NULL,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id),
        UNIQUE KEY unique_email (email),
        UNIQUE KEY unique_device_id (device_id)
      )
      ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
    `);

    console.log('Licenses table is ready.');
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Database initialization failed.');
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
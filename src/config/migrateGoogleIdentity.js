require('dotenv').config();

const mysql = require('mysql2/promise');

async function migrateGoogleIdentity() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Connected to MySQL database.');

    const [columns] = await connection.query(`
      SHOW COLUMNS FROM licenses LIKE 'google_id'
    `);

    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE licenses
        ADD COLUMN google_id VARCHAR(255) NULL
        AFTER email
      `);

      console.log('google_id column added successfully.');
    } else {
      console.log('google_id column already exists.');
    }

    const [indexes] = await connection.query(`
      SHOW INDEX FROM licenses
      WHERE Key_name = 'unique_google_id'
    `);

    if (indexes.length === 0) {
      await connection.query(`
        ALTER TABLE licenses
        ADD UNIQUE KEY unique_google_id (google_id)
      `);

      console.log('unique_google_id index added successfully.');
    } else {
      console.log('unique_google_id index already exists.');
    }

    console.log('Google identity migration completed successfully.');
  } catch (error) {
    console.error('Google identity migration failed.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrateGoogleIdentity();
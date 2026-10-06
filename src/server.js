require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { testDatabaseConnection } = require('./config/database');
const licenseRoutes = require('./routes/licenseRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api/licenses', licenseRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Library Manager License Server is running.',
  });
});

app.get('/api/health', async (req, res) => {
  const databaseOnline = await testDatabaseConnection();

  res.json({
    success: true,
    status: 'online',
    database: databaseOnline ? 'connected' : 'disconnected',
  });
});

async function startServer() {
  const databaseConnected = await testDatabaseConnection();

  if (!databaseConnected) {
    console.error(
      'Server startup stopped because the database connection failed.',
    );
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`License server running on http://localhost:${PORT}`);
  });
}

startServer();
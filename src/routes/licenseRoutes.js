const express = require('express');

const {
  createLicenseRequest,
  getLicenseByEmail,
} = require('../controllers/licenseController');

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'License API is working.',
  });
});

router.post('/request', createLicenseRequest);

router.get('/email/:email', getLicenseByEmail);

module.exports = router;
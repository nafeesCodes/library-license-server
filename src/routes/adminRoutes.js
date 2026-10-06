const express = require('express');

const {
  getAllLicenses,
  activateLicense,
  suspendLicense,
} = require('../controllers/adminController');

const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Every admin route requires authentication.
router.use(adminAuth);

router.get('/licenses', getAllLicenses);

router.post('/licenses/:id/activate', activateLicense);

router.post('/licenses/:id/suspend', suspendLicense);

module.exports = router;
const { pool } = require('../config/database');

async function getAllLicenses(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        email,
        google_name,
        college_name,
        status,
        device_id,
        last_check_at,
        created_at,
        updated_at
      FROM licenses
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      licenses: rows,
    });
  } catch (error) {
    console.error('Get all licenses failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve licenses.',
    });
  }
}

async function activateLicense(req, res) {
  try {
    const licenseId = Number(req.params.id);

    if (!Number.isInteger(licenseId) || licenseId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid license ID.',
      });
    }

    const [result] = await pool.query(
      `
      UPDATE licenses
      SET status = 'active'
      WHERE id = ?
      `,
      [licenseId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'License not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'License activated successfully.',
    });
  } catch (error) {
    console.error('Activate license failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to activate license.',
    });
  }
}

async function suspendLicense(req, res) {
  try {
    const licenseId = Number(req.params.id);

    if (!Number.isInteger(licenseId) || licenseId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid license ID.',
      });
    }

    const [result] = await pool.query(
      `
      UPDATE licenses
      SET status = 'suspended'
      WHERE id = ?
      `,
      [licenseId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'License not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'License suspended successfully.',
    });
  } catch (error) {
    console.error('Suspend license failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to suspend license.',
    });
  }
}

module.exports = {
  getAllLicenses,
  activateLicense,
  suspendLicense,
};
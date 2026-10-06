const { pool } = require('../config/database');
const { verifyGoogleIdToken } = require('../services/googleAuth');

async function createLicenseRequest(req, res) {
  try {
    const {
      idToken,
      college_name,
      device_id,
    } = req.body;

    if (!idToken || !idToken.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required.',
      });
    }

    const googleUser = await verifyGoogleIdToken(idToken);

    const normalizedEmail = googleUser.email.trim().toLowerCase();

    const [existingRows] = await pool.query(
      `
      SELECT
        id,
        email,
        google_id,
        google_name,
        college_name,
        status,
        device_id,
        last_check_at,
        created_at,
        updated_at
      FROM licenses
      WHERE google_id = ?
         OR email = ?
      LIMIT 1
      `,
      [
        googleUser.googleId,
        normalizedEmail,
      ],
    );

    if (existingRows.length > 0) {
      const existingLicense = existingRows[0];

      return res.status(200).json({
        success: true,
        message: 'License already exists.',
        license: existingLicense,
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO licenses (
        email,
        google_id,
        google_name,
        college_name,
        status,
        device_id
      )
      VALUES (?, ?, ?, ?, 'pending', ?)
      `,
      [
        normalizedEmail,
        googleUser.googleId,
        googleUser.name || null,
        college_name?.trim() || null,
        device_id?.trim() || null,
      ],
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        email,
        google_id,
        google_name,
        college_name,
        status,
        device_id,
        last_check_at,
        created_at,
        updated_at
      FROM licenses
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId],
    );

    return res.status(201).json({
      success: true,
      message: 'License request submitted successfully.',
      license: rows[0],
    });
  } catch (error) {
    console.error(
      'Create license request failed:',
      error.message,
    );

    return res.status(401).json({
      success: false,
      message: 'Google authentication failed.',
    });
  }
}

async function getLicenseByEmail(req, res) {
  try {
    const email = req.params.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        id,
        email,
        google_id,
        google_name,
        college_name,
        status,
        device_id,
        last_check_at,
        created_at,
        updated_at
      FROM licenses
      WHERE email = ?
      LIMIT 1
      `,
      [email],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'License not found.',
      });
    }

    await pool.query(
      `
      UPDATE licenses
      SET last_check_at = NOW()
      WHERE id = ?
      `,
      [rows[0].id],
    );

    rows[0].last_check_at = new Date();

    return res.status(200).json({
      success: true,
      license: rows[0],
    });
  } catch (error) {
    console.error(
      'Get license failed:',
      error.message,
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve license.',
    });
  }
}

module.exports = {
  createLicenseRequest,
  getLicenseByEmail,
};
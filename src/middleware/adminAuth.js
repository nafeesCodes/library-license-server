function adminAuth(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error(
      'ADMIN_PASSWORD is not configured in the environment.'
    );

    return res.status(500).json({
      success: false,
      message: 'Admin authentication is not configured.',
    });
  }

  const providedPassword = req.headers['x-admin-password'];

  if (!providedPassword) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required.',
    });
  }

  if (providedPassword !== adminPassword) {
    return res.status(403).json({
      success: false,
      message: 'Invalid admin credentials.',
    });
  }

  next();
}

module.exports = adminAuth;
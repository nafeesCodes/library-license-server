const { OAuth2Client } = require('google-auth-library');

const GOOGLE_WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID;

if (!GOOGLE_WEB_CLIENT_ID) {
  console.warn(
    'GOOGLE_WEB_CLIENT_ID is not configured yet.'
  );
}

const client = new OAuth2Client(GOOGLE_WEB_CLIENT_ID);

async function verifyGoogleIdToken(idToken) {
  if (!idToken || !idToken.trim()) {
    throw new Error('Google ID token is required.');
  }

  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error(
      'GOOGLE_WEB_CLIENT_ID is not configured.'
    );
  }

  const ticket = await client.verifyIdToken({
    idToken: idToken.trim(),
    audience: GOOGLE_WEB_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error('Invalid Google ID token.');
  }

  if (!payload.sub) {
    throw new Error(
      'Google account ID is missing from token.'
    );
  }

  if (!payload.email) {
    throw new Error(
      'Google account email is missing from token.'
    );
  }

  if (payload.email_verified !== true) {
    throw new Error(
      'Google email address is not verified.'
    );
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || '',
    picture: payload.picture || '',
  };
}

module.exports = {
  verifyGoogleIdToken,
};
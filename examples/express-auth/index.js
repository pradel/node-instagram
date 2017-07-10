const express = require('express');
const Instagram = require('../../lib').default;

// Create a new instance.
const instagram = new Instagram({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
});

const redirectUri = 'http://localhost:3000/auth/instagram/callback';

// create express server
const app = express();

// Redirect user to instagram oauth
app.get('/auth/instagram', (req, res) => {
  res.redirect(instagram.getAuthorizationUrl(redirectUri, { scope: ['basic'] }));
});

// Handle auth code and get access_token for user
app.get('/auth/instagram/callback', async (req, res) => {
  try {
    const data = await instagram.authorizeUser(req.query.code, redirectUri);
    // access_token in data.access_token
    res.json(data);
  } catch (err) {
    res.json(err);
  }
});

// listen to port 3000
app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});

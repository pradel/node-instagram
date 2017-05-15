// require module
const Instagram = require('../lib').default;

// Create a new instance.
const instagram = new Instagram({
  clientId: 'your-client-id',
  accessToken: 'user-access-token',
});

// You can use callbacks or promises
instagram.get('users/self', (err, data) => {
  console.log(err, data);
});

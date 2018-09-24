[![npm version](https://badge.fury.io/js/node-instagram.svg)](https://badge.fury.io/js/node-instagram)
[![npm](https://img.shields.io/npm/dm/node-instagram.svg)](https://www.npmjs.com/package/node-instagram)
[![Build Status](https://travis-ci.org/pradel/node-instagram.svg?branch=master)](https://travis-ci.org/pradel/node-instagram)
[![Coverage Status](https://coveralls.io/repos/github/pradel/node-instagram/badge.svg?branch=master)](https://coveralls.io/github/pradel/node-instagram?branch=master)
[![Dependency Status](https://david-dm.org/pradel/node-instagram.svg)](https://david-dm.org/pradel/node-instagram)
[![Known Vulnerabilities](https://snyk.io/test/npm/node-instagram/badge.svg)](https://snyk.io/test/npm/node-instagram)

# node-instagram

Instagram api client for node that support promises and typescript.

You can find examples in the [examples](https://github.com/pradel/node-instagram/tree/master/examples) directory.

## Install

`npm install --save node-instagram`

`yarn add node-instagram`

## Usage

```javascript
import Instagram from 'node-instagram';
// or
const Instagram = require('node-instagram').default;

// Create a new instance.
const instagram = new Instagram({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  accessToken: 'user-access-token',
});

// You can use callbacks or promises
instagram.get('users/self', (err, data) => {
  if (err) {
    // an error occured
    console.log(err);
  } else {
    console.log(data);
  }
});

// Get information about the owner of the access_token.
const data = await instagram.get('users/self');
console.log(data);

// Handle errors
instagram
  .get('tags/paris')
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    // An error occured
    console.log(err);
  });
```

## Streaming

This lib have a stream method. It is used to receive new post as events. Streaming **can only be used** on all endpoints taking MIN_TAG_ID as parameter. Inside it is running setInterval.

```javascript
const stream = instagram.stream('tags/:tag-name/media/recent');

stream.on('messages', messages => {
  console.log(messages);
});

// handle stream error
stream.on('error', err => {
  // An error occur
  console.log(err);
});
```

## Server side authentication

Two steps are needed in order to receive an access_token for a user.

- Get an authentication url from instagram and redirect the user to it
- Exchange the code for an access_token

You can find a working example with express [here](https://github.com/pradel/node-instagram/tree/master/examples/express-auth).

To see more info about server side authentication take a look at the [instagram documentation](https://www.instagram.com/developer/authentication/).

```javascript
// Example with express

// Your redirect url where you will handle the code param
const redirectUri = 'http://localhost:3000/auth/instagram/callback';

// First redirect user to instagram oauth
app.get('/auth/instagram', (req, res) => {
  res.redirect(
    instagram.getAuthorizationUrl(
      redirectUri,
      {
        // an array of scopes
        scope: ['basic', 'likes'],
      },
      // an optional state
      (state: 'your state')
    )
  );
});

// Handle auth code and get access_token for user
app.get('/auth/instagram/callback', async (req, res) => {
  try {
    // The code from the request, here req.query.code for express
    const code = req.query.code;
    const data = await instagram.authorizeUser(code, redirectUri);
    // data.access_token contain the user access_token
    res.json(data);
  } catch (err) {
    res.json(err);
  }
});
```

## Endpoints

To see all endpoint available take a look at [instagram developer documentation](https://www.instagram.com/developer/endpoints/).

```javascript
// Get information about current user
instagram.get('users/self', (err, data) => {
  console.log(data);
});

// Get information about a user.
instagram.get('users/:user-id').then(data => {
  console.log(data);
});

// Get the most recent media published by the owner of the access_token.
instagram.get('users/self/media/recent').then(data => {
  console.log(data);
});

// Get the most recent media published by a user.
instagram.get('users/:user-id/media/recent').then(data => {
  console.log(data);
});

// Get the list of recent media liked by the owner of the access_token.
instagram.get('users/self/media/liked').then(data => {
  console.log(data);
});

// Get a list of users matching the query.
instagram.get('users/search', { q: 'paris' }).then(data => {
  console.log(data);
});

// Get information about this media.
instagram.get('media/:media-id').then(data => {
  console.log(data);
});

// Get a list of users who have liked this media.
instagram.get('media/:media-id/likes').then(data => {
  console.log(data);
});

// Set a like on this media by the currently authenticated user.
instagram.post('media/:media-id/likes').then(data => {
  console.log(data);
});

// Remove a like on this media by the currently authenticated user.
instagram.delete('media/:media-id/likes').then(data => {
  console.log(data);
});

// Get information about a tag object.
instagram.get('tags/:tag-name').then(data => {
  console.log(data);
});

// Get a list of recently tagged media.
instagram.get('tags/:tag-name/media/recent').then(data => {
  console.log(data);
});

// Search for tags by name.
instagram.get('tags/search', { q: 'paris' }).then(data => {
  console.log(data);
});
```

It is also possible to send the access_token along as a parameter when you call an endpoint. For example:

```javascript
// Get information about current user
instagram.get('users/self', { access_token: accessToken }, (err, data) => {
  console.log(data);
});

// Search for tags by name.
instagram
  .get('tags/search', { access_token: accessToken, q: 'paris' })
  .then(data => {
    console.log(data);
  });
```

## Api

### `const instagram = new Instagram(config)`

Create a new Instagram instance

#### Arguments

- `clientId` **string**
- `accessToken` **string**

### `instagram.get(endpoint, [params, callback])`

Make a GET request on endpoint

#### Arguments

- `endpoint` **string**
- `params` **object**
- `callback` **function**

### `instagram.post(endpoint, [params, callback])`

Make a POST request on endpoint

#### Arguments

- `endpoint` **string**
- `params` **object**
- `callback` **function**

### `instagram.delete(endpoint, [params, callback])`

Make a DELETE request on endpoint

#### Arguments

- `endpoint` **string**
- `params` **object**
- `callback` **function**

### `instagram.stream(endpoint, params)`

Start a fake stream to a endpoint and return new messages found

#### Arguments

- `endpoint` **string**
- `params` **object**
- `params.interval` **number** interval to run inside **default** 10000
- `params.runOnCreation` **boolean** run the request when creating object
- `params.minTagId` **boolean** instagram min_tag_id to start request

### `instagram.getAuthorizationUrl(redirectUri, options)`

Get a valid auth url for instagram

#### Arguments

- `redirectUri` **string** the url to redirect the user with the code
- `options` **object**
- `options.scope` **array|string** the scope to request
- `options.state` **string** optional state
- `callback` **function**

### `instagram.authorizeUser(code, redirectUri, [callback])`

Handle the code returned by instagram an get a user access_token

#### Arguments

- `redirectUri` **string** code returned by instagram
- `redirectUri` **string**
- `callback` **function**

## License

MIT © [Léo Pradel](https://www.leopradel.com/)

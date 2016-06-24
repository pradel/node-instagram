[![npm version](https://badge.fury.io/js/node-instagram.svg)](https://badge.fury.io/js/node-instagram)
[![Build Status](https://travis-ci.org/pradel/node-instagram.svg?branch=master)](https://travis-ci.org/pradel/node-instagram)
[![Dependency Status](https://david-dm.org/pradel/node-instagram.svg)](https://david-dm.org/pradel/node-instagram)
[![devDependency Status](https://david-dm.org/pradel/node-instagram/dev-status.svg)](https://david-dm.org/pradel/node-instagram#info=devDependencies)

# node-instagram

Instagram api client for node that support promises.

To see all endpoint available take a look at [instagram developer documentation](https://www.instagram.com/developer/endpoints/).

## Install

`npm install --save node-instagram`

## Usage

```javascript
import Instagram from 'node-instagram';

// Create a new instance.
const instagram = new Instagram({
  clientId: 'your-client-id',
  accessToken: 'user-access-token',
});

// Get information about the owner of the access_token.
instagram.get('users/self').then((data) => {
  console.log(data);
});

// Get information about a user.
instagram.get('users/:user-id').then((data) => {
  console.log(data);
});

// Get the most recent media published by the owner of the access_token.
instagram.get('users/self/media/recent').then((data) => {
  console.log(data);
});

// Get the most recent media published by a user.
instagram.get('users/:user-id/media/recent').then((data) => {
  console.log(data);
});

// Get the list of recent media liked by the owner of the access_token.
instagram.get('users/self/media/liked').then((data) => {
  console.log(data);
});

// Get a list of users matching the query.
instagram.get('users/search', { q: 'paris' }).then((data) => {
  console.log(data);
});

// Get a list of users who have liked this media.
instagram.get('media/:media-id/likes').then((data) => {
  console.log(data);
});

// Set a like on this media by the currently authenticated user.
instagram.post('media/:media-id/likes').then((data) => {
  console.log(data);
});

// Remove a like on this media by the currently authenticated user.
instagram.delete('media/:media-id/likes').then((data) => {
  console.log(data);
});

// Get information about a tag object.
instagram.get('tags/:tag-name').then((data) => {
  console.log(data);
});

// Get a list of recently tagged media.
instagram.get('tags/:tag-name/media/recent').then((data) => {
  console.log(data);
});

// Search for tags by name.
instagram.get('tags/search', { q: 'paris' }).then((data) => {
  console.log(data);
});

// Handle errors
instagram.get('tags/paris').then((data) => {
  console.log(data);
}).catch((err) => {
  // An error occur
  console.log(err);
});

// Fake stream for instagram (running setInterval inside)
// Streaming can be used on all endpoints taking MIN_TAG_ID as parameter
const stream = instagram.stream('tags/:tag-name/media/recent');

stream.on('messages', (messages) => {
  console.log(messages);
});

// handle stream error
stream.on('error', (err) => {
  // An error occur
  console.log(err);
});

```

## Api

###`const instagram = new Instagram(config)`
Create a new Instagram instance
####Arguments
* `clientId` **string**
* `accessToken` **string**

###`instagram.get(endpoint, params)`
Make a GET request on endpoint
####Arguments
* `endpoint` **string**
* `params` **object**

###`instagram.post(endpoint, params)`
Make a POST request on endpoint
####Arguments
* `endpoint` **string**
* `params` **object**

###`instagram.delete(endpoint, params)`
Make a DELETE request on endpoint
####Arguments
* `endpoint` **string**
* `params` **object**

###`instagram.stram(endpoint, params)`
Start a fake stream to a endpoint and return new messages found
####Arguments
* `endpoint` **string**
* `params` **object**
* `params.interval` **number** interval to run inside **default** 10000 
* `params.runOnCreation` **boolean** run the request when creating object
* `params.minTagId` **boolean** instagram min_tag_id to start request

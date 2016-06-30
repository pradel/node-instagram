import rp from 'request-promise';
import isFunction from 'lodash.isfunction';
import Stream from './stream';

class Instagram {
  /**
   * Create a new instance of instagram class
   * @param {Object} options
   * @param {String} options.clientId
   * @param {String} options.accessToken
   */
  constructor(options = {}) {
    this.baseApi = 'https://api.instagram.com/v1/';
    this.clientId = options.clientId;
    this.accessToken = options.accessToken;
  }

  /**
   * Send a request
   * @param  {String} type
   * @param  {String} endpoint
   * @param  {Object} options
   * @param  {Function} callback
   * @return {Promise}
   * @private
   */
  request(type, endpoint, options = {}, callback) {
    if (isFunction(options)) {
      callback = options;
      options = {};
    }
    let key = 'qs';
    let accessToken = this.accessToken;
    if (options.accessToken) {
      accessToken = options.accessToken;
      delete options.accessToken; // eslint-disable-line no-param-reassign
    }
    if (type === 'POST') {
      key = 'body';
    }
    return rp({
      method: type,
      uri: `${this.baseApi}${endpoint}`,
      [key]: Object.assign({
        access_token: accessToken,
      }, options),
      json: true,
    })
    .then((data) => {
      if (isFunction(callback)) {
        callback(null, data);
      }
      return data;
    })
    .catch((err) => {
      const error = err.error || err;
      if (isFunction(callback)) {
        return callback(error);
      }
      throw error;
    });
  }

  /**
   * Send a GET request
   * @param  {String} endpoint
   * @param  {Object} [options]
   * @param  {Function} [callback]
   * @return {Promise}
   */
  get(endpoint, options, callback) {
    return this.request('GET', endpoint, options, callback);
  }

  /**
   * Send a POST request
   * @param  {String} endpoint
   * @param  {Object} [options]
   * @param  {Function} [callback]
   * @return {Promise}
   */
  post(endpoint, options, callback) {
    return this.request('POST', endpoint, options, callback);
  }

  /**
   * Send a DELETE request
   * @param  {String} endpoint
   * @param  {Object} [options]
   * @param  {Function} [callback]
   * @return {Promise}
   */
  delete(endpoint, options, callback) {
    return this.request('DELETE', endpoint, options, callback);
  }

  /**
   * Create a new instagram stream
   * @param  {String} endpoint
   * @param  {Object} [options]
   * @return {EventEmitter}
   */
  stream(endpoint, options) {
    return new Stream(this, endpoint, options);
  }
}

export default Instagram;

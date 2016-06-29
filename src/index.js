import rp from 'request-promise';
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
   * @return {Promise}
   * @private
   */
  request(type, endpoint, options = {}) {
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
    }).catch((err) => {
      throw err.error || err;
    });
  }

  /**
   * Send a GET request
   * @param  {String} endpoint
   * @param  {Object} [options]
   * @return {Promise}
   */
  get(endpoint, options) {
    return this.request('GET', endpoint, options);
  }

  /**
   * Send a POST request
   * @param  {String} endpoint
   * @param  {Object} [options]
   * @return {Promise}
   */
  post(endpoint, options) {
    return this.request('POST', endpoint, options);
  }

  /**
   * Send a DELETE request
   * @param  {String} endpoint
   * @param  {Object} [options]
   * @return {Promise}
   */
  delete(endpoint, options) {
    return this.request('DELETE', endpoint, options);
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

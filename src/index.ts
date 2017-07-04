import * as requestPromise from 'request-promise';
import * as isFunction from 'lodash.isfunction';
import Stream from './stream';

export interface InstagramConfig {
  clientId: string;
  accessToken: string;
  apiVersion?: string;
}

class Instagram {
  private apiUrl: string;
  private config: {
    clientId: string;
    accessToken: string;
  };

  /**
   * Create a new instance of instagram class
   * @param {Object} config
   * @param {String} config.clientId
   * @param {String} config.accessToken
   */
  constructor(config: InstagramConfig) {
    const apiVersion = config.apiVersion || 'v1';
    this.apiUrl = `https://api.instagram.com/${apiVersion}/`;
    this.config = {
      clientId: config.clientId,
      accessToken: config.accessToken,
    };
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
  request(
    type: string,
    endpoint: string,
    options: any = {},
    callback?: (err?: any, data?: any) => void
  ): Promise<any> {
    if (isFunction(options)) {
      callback = options;
      options = {};
    }
    let key = 'qs';
    let accessToken = this.config.accessToken;
    if (options.accessToken) {
      accessToken = options.accessToken;
      delete options.accessToken; // eslint-disable-line no-param-reassign
    }
    if (type === 'POST') {
      key = 'form';
    }
    return requestPromise({
      method: type,
      uri: `${this.apiUrl}${endpoint}`,
      [key]: { access_token: accessToken, ...options },
      json: true,
    })
      .then(data => {
        if (isFunction(callback)) {
          callback(null, data);
        }
        return data;
      })
      .catch(err => {
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
  get(
    endpoint: string,
    options?: any,
    callback?: (err?: any, data?: any) => void
  ): Promise<any> {
    return this.request('GET', endpoint, options, callback);
  }

  /**
   * Send a POST request
   * @param  {String} endpoint
   * @param  {Object} [options]
   * @param  {Function} [callback]
   * @return {Promise}
   */
  post(
    endpoint: string,
    options?: any,
    callback?: (err?: any, data?: any) => void
  ): Promise<any> {
    return this.request('POST', endpoint, options, callback);
  }

  /**
   * Send a DELETE request
   * @param  {String} endpoint
   * @param  {Object} [options]
   * @param  {Function} [callback]
   * @return {Promise}
   */
  delete(
    endpoint: string,
    options?: any,
    callback?: (err?: any, data?: any) => void
  ): Promise<any> {
    return this.request('DELETE', endpoint, options, callback);
  }

  /**
   * Create a new instagram stream
   * @param  {String} endpoint
   * @param  {Object} [options]
   * @return {EventEmitter}
   */
  stream(endpoint: string, options?: any): Stream {
    return new Stream(this, endpoint, options);
  }
}

export default Instagram;

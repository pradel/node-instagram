import { isArray, isFunction } from 'lodash';
import fetch from 'node-fetch';
import * as queryString from 'query-string';
import Stream from './stream';

export interface InstagramConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  apiVersion?: string;
}

class Instagram {
  private baseApiUrl: string;
  private apiUrl: string;
  private config: {
    clientId: string;
    clientSecret: string;
    accessToken: string;
  };

  /**
   * Create a new instance of instagram class
   * @param config
   * @param config.clientId
   * @param config.accessToken
   */
  constructor(config: InstagramConfig) {
    const apiVersion = config.apiVersion || 'v1';
    this.baseApiUrl = 'https://api.instagram.com';
    this.apiUrl = `${this.baseApiUrl}/${apiVersion}/`;
    this.config = {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      accessToken: config.accessToken,
    };
  }

  /**
   * Send a GET request
   * @param endpoint
   * @param [options]
   * @param [callback]
   */
  public get(
    endpoint: string,
    options?: any,
    callback?: (err?: any, data?: any) => void
  ): Promise<any> {
    return this.request('GET', endpoint, options, callback);
  }

  /**
   * Send a POST request
   * @param endpoint
   * @param [options]
   * @param [callback]
   */
  public post(
    endpoint: string,
    options?: any,
    callback?: (err?: any, data?: any) => void
  ): Promise<any> {
    return this.request('POST', endpoint, options, callback);
  }

  /**
   * Send a DELETE request
   * @param endpoint
   * @param [options]
   * @param [callback]
   */
  public delete(
    endpoint: string,
    options?: any,
    callback?: (err?: any, data?: any) => void
  ): Promise<any> {
    return this.request('DELETE', endpoint, options, callback);
  }

  /**
   * Create a new instagram stream
   * @param endpoint
   * @param [options]
   */
  public stream(endpoint: string, options?: any): Stream {
    return new Stream(this, endpoint, options);
  }

  /**
   * Get instagram authorization url
   * @param redirectUri
   */
  public getAuthorizationUrl(redirectUri: string, options: any = {}): string {
    let authorizationUrl = `${this.baseApiUrl}/oauth/authorize/?client_id=${this
      .config.clientId}&redirect_uri=${redirectUri}&response_type=code`;
    if (options.scope) {
      if (isArray(options.scope)) {
        options.scope = options.scope.join('+');
      }
      authorizationUrl += `&scope=${options.scope}`;
    }
    if (options.state) {
      authorizationUrl += `&state=${options.state}`;
    }
    return authorizationUrl;
  }

  /**
   * Authorize the user and return an access_token
   * @param code
   * @param redirectUri
   */
  public authorizeUser(
    code: string,
    redirectUri: string,
    callback?: (err?: any, data?: any) => void
  ): Promise<any> {
    return this.request(
      'POST',
      'oauth/access_token',
      {
        uriAbsolute: true,
        code,
        redirect_uri: redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'authorization_code',
      },
      callback
    );
  }

  /**
   * Send a request
   * @param type
   * @param endpoint
   * @param options
   * @param callback
   * @private
   */
  private async request(
    type: string,
    endpoint: string,
    options: any = {},
    callback?: (err?: any, data?: any) => void
  ): Promise<any> {
    try {
      if (isFunction(options)) {
        callback = options;
        options = {};
      }
      let stringify = true;
      const headers = {};
      let uri = `${this.apiUrl}${endpoint}`;
      if (this.config.accessToken) {
        options.access_token = this.config.accessToken;
      }
      if (options.accessToken) {
        options.access_token = options.accessToken;
        delete options.accessToken;
      }
      if (options.uriAbsolute) {
        uri = `${this.baseApiUrl}/${endpoint}`;
        delete options.uriAbsolute;
      }
      if (type === 'GET' || type === 'DELETE') {
        uri += `?${queryString.stringify(options)}`;
        options = null;
      } else if (type === 'POST') {
        headers['Content-Type'] =
          'application/x-www-form-urlencoded;charset=UTF-8';
        options = queryString.stringify(options);
        stringify = false;
      }
      const response = await fetch(uri, {
        method: type,
        body: options && stringify ? JSON.stringify(options) : options || null,
        headers,
      });
      const json = await response.json();
      if (!response.ok) {
        throw json;
      }
      if (isFunction(callback)) {
        callback(null, json);
      }
      return json;
    } catch (err) {
      const error = err.error || err;
      if (isFunction(callback)) {
        return callback(error);
      }
      throw error;
    }
  }
}

export default Instagram;

import rp from 'request-promise';

class Instagram {
  constructor(options = {}) {
    this.baseApi = 'https://api.instagram.com/v1/';
    this.clientId = options.clientId;
    this.accessToken = options.accessToken;
  }

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

  get(endpoint, options) {
    return this.request('GET', endpoint, options);
  }

  post(endpoint, options) {
    return this.request('POST', endpoint, options);
  }

  delete(endpoint, options) {
    return this.request('DELETE', endpoint, options);
  }
}

export default Instagram;

import * as nock from 'nock';
import Instagram from '../src/index';

describe('Instagram', () => {
  it('should be a class', () => {
    const instagram = new Instagram({});
    expect(instagram instanceof Instagram).toBeTruthy();
  });

  it('should set clientId and accessToken', () => {
    const instagram = new Instagram({
      clientId: 'toto',
      accessToken: 'toto2',
    });
    expect(instagram.config.clientId).toEqual('toto');
    expect(instagram.config.accessToken).toEqual('toto2');
  });

  describe('#request', () => {
    const instagram = new Instagram({
      accessToken: 'toto',
    });

    it('sould add access_token in query', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, 'success');
      const result = await instagram.request('GET', endpoint);
      expect(result).toEqual('success');
    });

    it('sould overwrite access_token in query', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'titi' })
        .reply(200, 'success');
      const result = await instagram.request('GET', endpoint, {
        accessToken: 'titi',
      });
      expect(result).toEqual('success');
    });

    it('sould return an error', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(400, 'error');
      try {
        await instagram.request('GET', endpoint);
      } catch (e) {
        expect(e).toEqual('error');
      }
    });

    it('sould call callback with value', done => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, 'success');
      instagram.request('GET', endpoint, (err, result) => {
        expect(result).toEqual('success');
        done();
      });
    });

    it('sould call callback with error', done => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(400, 'error');
      instagram.request('GET', endpoint, err => {
        expect(err).toEqual('error');
        done();
      });
    });
  });

  describe('#get', () => {
    const instagram = new Instagram({
      accessToken: 'toto',
    });

    it('sould make get request', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, 'success');
      const result = await instagram.get(endpoint);
      expect(result).toEqual('success');
    });
  });

  describe('#post', () => {
    const instagram = new Instagram({
      accessToken: 'toto',
    });

    it('sould make post request', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .post(`/v1/${endpoint}`, {
          access_token: 'toto',
        })
        .reply(200, 'success');
      const result = await instagram.post(endpoint);
      expect(result).toEqual('success');
    });
  });

  describe('#delete', () => {
    const instagram = new Instagram({
      accessToken: 'toto',
    });

    it('sould make delete request', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .delete(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, 'success');
      const result = await instagram.delete(endpoint);
      expect(result).toEqual('success');
    });
  });

  describe('#getAuthorizationUrl', () => {
    const instagram = new Instagram({
      clientId: 'clientId',
      accessToken: 'toto',
    });
    const redirectUrl = 'http://localhost:3000';

    it('sould generate authorization url', async () => {
      const url = instagram.getAuthorizationUrl(redirectUrl);
      expect(url).toMatchSnapshot();
    });

    it('sould generate pass scope', async () => {
      const url = instagram.getAuthorizationUrl(redirectUrl, {
        scope: 'likes',
      });
      expect(url).toMatchSnapshot();
    });

    it('sould generate pass scope array', async () => {
      const url = instagram.getAuthorizationUrl(redirectUrl, {
        scope: ['likes', 'basic'],
      });
      expect(url).toMatchSnapshot();
    });

    it('sould generate pass state', async () => {
      const url = instagram.getAuthorizationUrl(redirectUrl, { state: 'hey' });
      expect(url).toMatchSnapshot();
    });
  });

  describe('#authorizeUser', () => {
    const instagram = new Instagram({
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      accessToken: 'toto',
    });
    const code = 'my-code';
    const redirectUrl = 'http://localhost:3000';

    it('sould make post request', async () => {
      nock('https://api.instagram.com')
        .post('/oauth/access_token', {
          code,
          redirect_uri: redirectUrl,
          client_id: 'clientId',
          client_secret: 'clientSecret',
          grant_type: 'authorization_code',
        })
        .reply(200, 'success');
      const result = await instagram.authorizeUser(code, redirectUrl);
      expect(result).toEqual('success');
    });
  });
});

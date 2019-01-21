// tslint:disable-next-line no-implicit-dependencies
import * as nock from 'nock';
import Instagram from '../src/index';

describe('Instagram', () => {
  it('should be a class', () => {
    const instagram = new Instagram({} as any);
    expect(instagram instanceof Instagram).toBeTruthy();
  });

  it('should set clientId and accessToken', () => {
    const instagram = new Instagram({
      clientId: 'toto',
      accessToken: 'toto2',
    } as any);
    expect((instagram as any).config.clientId).toEqual('toto');
    expect((instagram as any).config.accessToken).toEqual('toto2');
  });

  describe('#request', () => {
    const instagram = new Instagram({
      accessToken: 'toto',
    } as any);

    it('sould add access_token in query', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, { message: 'success' });
      const result = await (instagram as any).request('GET', endpoint);
      expect(result).toMatchSnapshot();
    });

    it('sould overwrite access_token in query', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'titi' })
        .reply(200, { message: 'success' });
      const result = await (instagram as any).request('GET', endpoint, {
        accessToken: 'titi',
      });
      expect(result).toMatchSnapshot();
    });

    it('sould return an error', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(400, { message: 'error' });
      try {
        await (instagram as any).request('GET', endpoint);
      } catch (err) {
        expect(err).toMatchSnapshot();
      }
    });

    it('sould call callback with value', done => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, { message: 'success' });
      (instagram as any).request('GET', endpoint, (_, result) => {
        expect(result).toMatchSnapshot();
        done();
      });
    });

    it('sould call callback with error', done => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(400, { message: 'error' });
      (instagram as any).request('GET', endpoint, err => {
        expect(err).toMatchSnapshot();
        done();
      });
    });
  });

  describe('#get', () => {
    const instagram = new Instagram({
      accessToken: 'toto',
    } as any);

    it('sould make get request', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, { message: 'success' });
      const result = await instagram.get(endpoint);
      expect(result).toMatchSnapshot();
    });
  });

  describe('#post', () => {
    const instagram = new Instagram({
      accessToken: 'toto',
    } as any);

    it('sould make post request', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .post(`/v1/${endpoint}`, {
          access_token: 'toto',
        })
        .reply(200, { message: 'success' });
      const result = await instagram.post(endpoint);
      expect(result).toMatchSnapshot();
    });
  });

  describe('#delete', () => {
    const instagram = new Instagram({
      accessToken: 'toto',
    } as any);

    it('sould make delete request', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .delete(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, { message: 'success' });
      const result = await instagram.delete(endpoint);
      expect(result).toMatchSnapshot();
    });
  });

  describe('#getAuthorizationUrl', () => {
    const instagram = new Instagram({
      clientId: 'clientId',
      accessToken: 'toto',
    } as any);
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
    } as any);
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
        .reply(200, { message: 'success' });
      const result = await instagram.authorizeUser(code, redirectUrl);
      expect(result).toMatchSnapshot();
    });
  });
});

import 'babel-polyfill';
import { assert } from 'chai';
import nock from 'nock';
import Instagram from '../lib/index';

describe('Instagram', () => {
  it('should be a class', () => {
    const instagram = new Instagram({});
    assert.ok(instagram instanceof Instagram);
  });

  it('should set clientId and accessToken', () => {
    const instagram = new Instagram({
      clientId: 'toto',
      accessToken: 'toto2',
    });
    assert.equal(instagram.config.clientId, 'toto');
    assert.equal(instagram.config.accessToken, 'toto2');
  });

  describe('#request', () => {
    const instagram = new Instagram({
      accessToken: 'toto',
    });

    it('should be a function', () => {
      assert.isFunction(instagram.request);
    });

    it('sould add access_token in query', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, 'success');
      const result = await instagram.request('GET', endpoint);
      assert.equal(result, 'success');
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
      assert.equal(result, 'success');
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
        assert.equal(e, 'error');
      }
    });

    it('sould call callback with value', (done) => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, 'success');
      instagram.request('GET', endpoint, (err, data) => {
        assert.equal(data, 'success');
        done();
      });
    });

    it('sould call callback with error', (done) => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(400, 'error');
      instagram.request('GET', endpoint, (err) => {
        assert.equal(err, 'error');
        done();
      });
    });
  });

  describe('#get', () => {
    const instagram = new Instagram({
      accessToken: 'toto',
    });

    it('should be a function', () => {
      assert.isFunction(instagram.get);
    });

    it('sould make get request', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, 'success');
      const result = await instagram.get(endpoint);
      assert.equal(result, 'success');
    });
  });

  describe('#post', () => {
    const instagram = new Instagram({
      accessToken: 'toto',
    });

    it('should be a function', () => {
      assert.isFunction(instagram.post);
    });

    it('sould make post request', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .post(`/v1/${endpoint}`, {
          access_token: 'toto',
        })
        .reply(200, 'success');
      const result = await instagram.post(endpoint);
      assert.equal(result, 'success');
    });
  });

  describe('#delete', () => {
    const instagram = new Instagram({
      accessToken: 'toto',
    });

    it('should be a function', () => {
      assert.isFunction(instagram.delete);
    });

    it('sould make delete request', async () => {
      const endpoint = 'tag/sunset';
      nock('https://api.instagram.com')
        .delete(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, 'success');
      const result = await instagram.delete(endpoint);
      assert.equal(result, 'success');
    });
  });
});

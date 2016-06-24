import 'babel-polyfill';
import { assert } from 'chai';
import { spy } from 'sinon';
import nock from 'nock';
import EventEmitter from 'events';
import Instagram from '../src/index';
import Stream from '../src/stream';

describe('Stream', () => {
  const endpoint = 'tags/paris/media/recent';
  const instagram = new Instagram({
    accessToken: 'toto',
  });

  it('should be a class', () => {
    const stream = instagram.stream(endpoint, { runOnCreation: false });
    assert.ok(stream instanceof Stream);
  });

  it('should be a instanceof EventEmitter', () => {
    const stream = instagram.stream(endpoint, { runOnCreation: false });
    assert.ok(stream instanceof EventEmitter);
  });

  it('should set interval', () => {
    const interval = 3000;
    const stream = instagram.stream(endpoint, {
      runOnCreation: false,
      interval,
    });
    assert.equal(stream.interval, interval);
  });

  it('should set minTagId', () => {
    const minTagId = 'min';
    const stream = instagram.stream(endpoint, {
      runOnCreation: false,
      minTagId,
    });
    assert.equal(stream.minTagId, minTagId);
  });

  describe('#start', () => {
    it('should be a function', () => {
      const stream = instagram.stream(endpoint, { runOnCreation: false });
      assert.isFunction(stream.start);
    });

    it('should call makeRequest', () => {
      const stream = instagram.stream(endpoint, { runOnCreation: false });
      stream.makeRequest = spy();
      stream.start();
      assert.ok(stream.makeRequest.called);
      stream.stop();
    });

    it('should make interval on makeRequest', function (done) {
      this.timeout(3000);
      const stream = instagram.stream(endpoint, {
        runOnCreation: false,
        interval: 500,
      });
      stream.makeRequest = spy();
      stream.start();
      setTimeout(() => {
        assert.equal(stream.makeRequest.callCount, 5);
        stream.stop();
        done();
      }, 2500);
    });
  });

  describe('#stop', () => {
    it('should be a function', () => {
      const stream = instagram.stream(endpoint, { runOnCreation: false });
      assert.isFunction(stream.stop);
    });

    it('should stop interval', function (done) {
      this.timeout(5000);
      const stream = instagram.stream(endpoint, {
        runOnCreation: false,
        interval: 500,
      });
      stream.makeRequest = spy();
      stream.start();
      setTimeout(() => {
        assert.equal(stream.makeRequest.callCount, 5);
        stream.stop();
        setTimeout(() => {
          assert.equal(stream.makeRequest.callCount, 5);
          done();
        }, 1000);
      }, 2500);
    });
  });

  describe('#makeRequest', () => {
    it('should be a function', () => {
      const stream = instagram.stream(endpoint, { runOnCreation: false });
      assert.isFunction(stream.makeRequest);
    });

    it('should return messages event', (done) => {
      const data = [{ id: 'a' }, { id: 'b' }];
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, {
          pagination: {},
          data,
        });
      const stream = instagram.stream(endpoint);
      stream.on('messages', (messages) => {
        assert.deepEqual(messages, data);
        stream.stop();
        done();
      });
    });

    it('should return error event', (done) => {
      const data = [{ id: 'a' }, { id: 'b' }];
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(400, 'error');
      const stream = instagram.stream(endpoint);
      stream.on('error', (err) => {
        assert.equal(err, 'error');
        stream.stop();
        done();
      });
    });

    it('should add messages to cache', (done) => {
      const data = [{ id: 'a' }, { id: 'b' }];
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, {
          pagination: {},
          data,
        });
      const stream = instagram.stream(endpoint);
      stream.on('messages', (messages) => {
        assert.deepEqual(stream.cache, data.map(val => val.id));
        assert.deepEqual(messages, data);
        stream.stop();
        done();
      });
    });

    it('should not return messages in cache', (done) => {
      const data = [{ id: 'a' }, { id: 'b' }];
      const scope = nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .times(3)
        .reply(200, {
          pagination: {},
          data,
        });
      const stream = instagram.stream(endpoint, {
        interval: 500,
      });
      const callSpy = spy();
      stream.on('messages', callSpy);
      setTimeout(() => {
        stream.stop();
        assert.ok(scope.isDone());
        assert.equal(callSpy.callCount, 1);
        done();
      }, 1500);
    });

    it('should make a request with min_tag_id if provided', (done) => {
      const data = [{ id: 'a' }, { id: 'b' }];
      const scope1 = nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, {
          pagination: {
            min_tag_id: 'tag_id',
          },
          data,
        });
      const scope2 = nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto', min_tag_id: 'tag_id' })
        .reply(200, {
          pagination: {},
          data,
        });
      const stream = instagram.stream(endpoint, {
        interval: 500,
      });
      const callSpy = spy();
      stream.on('messages', callSpy);
      setTimeout(() => {
        stream.stop();
        assert.ok(scope1.isDone());
        assert.ok(scope2.isDone());
        assert.equal(callSpy.callCount, 2);
        done();
      }, 1000);
    });

    it('should make next request with min_tag_id if provided', (done) => {
      const data = [{ id: 'a' }, { id: 'b' }];
      const scope1 = nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, {
          pagination: {
            min_tag_id: 'tag_id',
          },
          data,
        });
      const scope2 = nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto', min_tag_id: 'tag_id' })
        .reply(200, {
          pagination: {},
          data,
        });
      const stream = instagram.stream(endpoint, {
        interval: 500,
      });
      const callSpy = spy();
      stream.on('messages', callSpy);
      setTimeout(() => {
        stream.stop();
        assert.ok(scope1.isDone());
        assert.ok(scope2.isDone());
        assert.equal(callSpy.callCount, 2);
        done();
      }, 1000);
    });

    it('should clear cache when min_tag_id is provided', (done) => {
      const data = [{ id: 'a' }, { id: 'b' }];
      const scope = nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, {
          pagination: {
            min_tag_id: 'tag_id',
          },
          data,
        });
      const stream = instagram.stream(endpoint);
      const callSpy = spy();
      stream.on('messages', callSpy);
      setTimeout(() => {
        stream.stop();
        assert.ok(scope.isDone());
        assert.equal(callSpy.callCount, 1);
        assert.deepEqual(stream.cache, []);
        done();
      }, 1000);
    });
  });
});

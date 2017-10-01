import * as EventEmitter from 'events';
import * as nock from 'nock';
import Instagram from '../src/index';
import Stream from '../src/stream';
import { generateNewMessage, generateOldMessage } from './utils';

describe('Stream', () => {
  const endpoint = 'tags/paris/media/recent';
  const instagram = new Instagram({
    accessToken: 'toto',
  });

  it('should be a class', () => {
    const stream = instagram.stream(endpoint, { runOnCreation: false });
    expect(stream instanceof Stream).toBeTruthy();
  });

  it('should be a instanceof EventEmitter', () => {
    const stream = instagram.stream(endpoint, { runOnCreation: false });
    expect(stream instanceof EventEmitter).toBeTruthy();
  });

  it('should set interval', () => {
    const interval = 3000;
    const stream = instagram.stream(endpoint, {
      runOnCreation: false,
      interval,
    });
    expect(stream.interval).toEqual(interval);
  });

  it('should set minTagId', () => {
    const minTagId = 'min';
    const stream = instagram.stream(endpoint, {
      runOnCreation: false,
      minTagId,
    });
    expect(stream.minTagId).toEqual(minTagId);
  });

  it('should overwrite accessToken', done => {
    const data = [generateNewMessage('a')];
    nock('https://api.instagram.com')
      .get(`/v1/${endpoint}`)
      .query({ access_token: 'accessToken' })
      .reply(200, {
        pagination: {},
        data,
      });
    const stream = instagram.stream(endpoint, { accessToken: 'accessToken' });
    stream.on('messages', messages => {
      expect(messages).toEqual(data);
      stream.stop();
      done();
    });
  });

  describe('#start', () => {
    it('should call makeRequest', () => {
      const stream = instagram.stream(endpoint, { runOnCreation: false });
      stream.makeRequest = jest.fn();
      stream.start();
      expect(stream.makeRequest.mock.calls.length).toEqual(1);
      stream.stop();
    });

    it('should interval on makeRequest', function intervalOnMakeRequest(done) {
      const stream = instagram.stream(endpoint, {
        runOnCreation: false,
        interval: 500,
      });
      stream.makeRequest = jest.fn();
      stream.start();
      setTimeout(() => {
        expect(stream.makeRequest.mock.calls.length).toEqual(5);
        stream.stop();
        done();
      }, 2500);
    });
  });

  describe('#stop', () => {
    it('should stop interval', function stopInterval(done) {
      const stream = instagram.stream(endpoint, {
        runOnCreation: false,
        interval: 500,
      });
      stream.makeRequest = jest.fn();
      stream.start();
      setTimeout(() => {
        expect(stream.makeRequest.mock.calls.length).toEqual(5);
        stream.stop();
        setTimeout(() => {
          expect(stream.makeRequest.mock.calls.length).toEqual(5);
          done();
        }, 1000);
      }, 2500);
    });
  });

  describe('#makeRequest', () => {
    it('should return messages event', done => {
      const data = [generateNewMessage('a'), generateNewMessage('b')];
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, {
          pagination: {},
          data,
        });
      const stream = instagram.stream(endpoint);
      stream.on('messages', messages => {
        expect(messages).toEqual(data);
        stream.stop();
        done();
      });
    });

    it('should return error event', done => {
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(400, { message: 'error' });
      const stream = instagram.stream(endpoint);
      stream.on('error', err => {
        expect(err).toMatchSnapshot();
        stream.stop();
        done();
      });
    });

    it('should not return old messages', done => {
      const data = [generateOldMessage('a'), generateNewMessage('b')];
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, {
          pagination: {},
          data,
        });
      const stream = instagram.stream(endpoint);
      stream.on('messages', messages => {
        expect(messages).toEqual([data[1]]);
        stream.stop();
        done();
      });
    });

    it('should add messages to cache', done => {
      const data = [generateNewMessage('a'), generateNewMessage('b')];
      nock('https://api.instagram.com')
        .get(`/v1/${endpoint}`)
        .query({ access_token: 'toto' })
        .reply(200, {
          pagination: {},
          data,
        });
      const stream = instagram.stream(endpoint);
      stream.on('messages', messages => {
        expect(stream.cache).toEqual(data.map(val => val.id));
        expect(messages).toEqual(data);
        stream.stop();
        done();
      });
    });

    it('should not return messages in cache', done => {
      const data = [generateNewMessage('a'), generateNewMessage('b')];
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
      const callSpy = jest.fn();
      stream.on('messages', callSpy);
      setTimeout(() => {
        stream.stop();
        expect(scope.isDone()).toBeTruthy();
        expect(callSpy.mock.calls.length).toEqual(1);
        done();
      }, 1500);
    });

    it('should make a request with min_tag_id if provided', done => {
      const data = [generateNewMessage('a'), generateNewMessage('b')];
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
      const callSpy = jest.fn();
      stream.on('messages', callSpy);
      setTimeout(() => {
        stream.stop();
        expect(scope1.isDone()).toBeTruthy();
        expect(scope2.isDone()).toBeTruthy();
        expect(callSpy.mock.calls.length).toEqual(2);
        done();
      }, 1000);
    });

    it('should make next request with min_tag_id if provided', done => {
      const data = [generateNewMessage('a'), generateNewMessage('b')];
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
      const callSpy = jest.fn();
      stream.on('messages', callSpy);
      setTimeout(() => {
        stream.stop();
        expect(scope1.isDone()).toBeTruthy();
        expect(scope2.isDone()).toBeTruthy();
        expect(callSpy.mock.calls.length).toEqual(2);
        done();
      }, 1000);
    });

    it('should clear cache when min_tag_id is provided', done => {
      const data = [generateNewMessage('a'), generateNewMessage('b')];
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
      const callSpy = jest.fn();
      stream.on('messages', callSpy);
      setTimeout(() => {
        stream.stop();
        expect(scope.isDone()).toBeTruthy();
        expect(callSpy.mock.calls.length).toEqual(1);
        expect(stream.cache).toEqual([]);
        done();
      }, 1000);
    });
  });
});

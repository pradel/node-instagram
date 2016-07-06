import EventEmitter from 'events';

class Stream extends EventEmitter {
  /**
   * Create a new instance of stream class
   * @param {Instagram} instagram
   * @param {String}    endpoint
   * @param {Object}    [options]
   * @param {Boolean}   [options.runOnCreation]
   * @param {Number}    [options.interval]
   * @param {String}    [options.minTagId]
   */
  constructor(instagram, endpoint, options = {}) {
    super();
    this.instagram = instagram;
    this.endpoint = endpoint;
    this.runOnCreation =
      options.runOnCreation === false ? options.runOnCreation : true;
    this.interval = options.interval || 10000;
    this.minTagId = options.minTagId;
    this.intervalId = null;
    this.cache = [];
    this.accessToken = options.accessToken;
    if (this.runOnCreation) {
      this.start();
    }
  }

  /**
   * Start the stream
   */
  start() {
    this.startDate = new Date();
    this.makeRequest();
    // Stop the old stream if there is one
    this.stop();
    // Start setInterval and store id
    this.intervalId = setInterval(this.makeRequest.bind(this), this.interval);
  }

  /**
   * Make a request on instagram API
   * Cache the result and emit only new messages
   */
  makeRequest() {
    const params = {
      accessToken: this.accessToken,
    };
    if (this.minTagId) {
      params.min_tag_id = this.minTagId;
    }
    this.instagram.get(this.endpoint, params)
      .then((data) => {
        if (data.data.length > 0) {
          // Only return messages not in cache
          let newPosts = data.data.filter((post) => this.cache.indexOf(post.id) === -1);
          this.cache.push(...newPosts.map(post => post.id));
          // Only return messages created after the stream
          newPosts = newPosts.filter((post) => this.startDate < post.created_time * 1000);
          if (data.pagination.min_tag_id) {
            this.minTagId = data.pagination.min_tag_id;
            this.cache = [];
          }
          if (newPosts.length > 0) {
            this.emit('messages', newPosts);
          }
        }
      })
      .catch((err) => {
        this.emit('error', err.error || err);
      });
  }

  /**
   * Stop the stream
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

export default Stream;

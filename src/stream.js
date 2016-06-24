import EventEmitter from 'events';

class Stream extends EventEmitter {
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
    if (this.runOnCreation) {
      this.start();
    }
  }

  start() {
    this.makeRequest();
    // Start request interval
    this.intervalId = setInterval(this.makeRequest.bind(this), this.interval);
  }

  makeRequest() {
    const params = {};
    if (this.minTagId) {
      params.min_tag_id = this.minTagId;
    }
    this.instagram.get(this.endpoint, params)
      .then((data) => {
        if (data.data.length > 0) {
          const newPosts = data.data.filter((post) => this.cache.indexOf(post.id) === -1);
          this.cache.push(...newPosts.map(post => post.id));
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

  stop() {
    clearInterval(this.intervalId);
  }
}

export default Stream;

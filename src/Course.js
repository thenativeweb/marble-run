'use strict';

const PQueue = require('p-queue');

class Course {
  constructor ({ trackCount, concurrencyPerTrack } = {}) {
    if (!trackCount) {
      trackCount = 256;
    }
    if (!concurrencyPerTrack) {
      concurrencyPerTrack = 1;
    }

    this.tracks = [];

    for (let i = 0; i < trackCount; i++) {
      this.tracks[i] = { todos: [], queue: new PQueue({ concurrency: concurrencyPerTrack }) };
    }
  }

  static findBestTrackForRoutingKey ({ tracks, routingKey } = {}) {
    if (!tracks) {
      throw new Error('Tracks are missing.');
    }
    if (!routingKey) {
      throw new Error('Routing key is missing.');
    }

    const existingTrackForKey = tracks.find(track => track.todos.find(todo => todo.routingKey === routingKey));

    if (existingTrackForKey) {
      return existingTrackForKey;
    }

    const freeTrack = tracks.find(track => track.todos.length === 0);

    if (freeTrack) {
      return freeTrack;
    }

    // Slice the original array in order not to mutate it via sort
    const tracksSortedByTodos = tracks.slice().sort((firstTrack, secondTrack) => firstTrack.todos.length - secondTrack.todos.length);

    return tracksSortedByTodos[0];
  }

  async add ({ routingKey, id, worker } = {}) {
    if (!routingKey) {
      throw new Error('Routing key is missing.');
    }
    if (!id) {
      throw new Error('Id is missing.');
    }
    if (!worker) {
      throw new Error('Worker is missing.');
    }
    if (typeof worker !== 'function') {
      throw new Error('Worker is not a function.');
    }

    const trackForWorker = Course.findBestTrackForRoutingKey({ tracks: this.tracks, routingKey });
    const todo = { routingKey, id };

    trackForWorker.todos.push(todo);

    try {
      await trackForWorker.queue.add(worker);
    } catch (ex) {
      throw new Error('Error during execution of worker.');
    } finally {
      const index = trackForWorker.todos.indexOf(todo);

      trackForWorker.todos.splice(index, 1);
    }
  }
}

module.exports = Course;

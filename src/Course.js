'use strict';

const PQueue = require('p-queue');

class Course {
  constructor ({ trackCount = 256, concurrencyPerTrack = 1 } = {}) {
    this.tracks = [];

    for (let i = 0; i < trackCount; i++) {
      this.tracks[i] = {
        tasks: [],
        queue: new PQueue({ concurrency: concurrencyPerTrack })
      };
    }
  }

  static findBestTrackForRoutingKey ({ tracks, routingKey } = {}) {
    if (!tracks) {
      throw new Error('Tracks are missing.');
    }
    if (!routingKey) {
      throw new Error('Routing key is missing.');
    }

    const existingTrackForKey = tracks.find(track => track.tasks.find(task => task.routingKey === routingKey));

    if (existingTrackForKey) {
      return existingTrackForKey;
    }

    const freeTrack = tracks.find(track => track.tasks.length === 0);

    if (freeTrack) {
      return freeTrack;
    }

    // Slice the original array in order not to mutate it via sort.
    const tracksSortedByTodos = tracks.slice().sort((firstTrack, secondTrack) => firstTrack.tasks.length - secondTrack.tasks.length);

    return tracksSortedByTodos[0];
  }

  async add ({ routingKey, id, task } = {}) {
    if (!routingKey) {
      throw new Error('Routing key is missing.');
    }
    if (!id) {
      throw new Error('Id is missing.');
    }
    if (!task) {
      throw new Error('Task is missing.');
    }
    if (typeof task !== 'function') {
      throw new Error('Task is not a function.');
    }

    const trackForTask = Course.findBestTrackForRoutingKey({ tracks: this.tracks, routingKey });
    const taskIdentity = { routingKey, id };

    trackForTask.tasks.push(taskIdentity);

    try {
      await trackForTask.queue.add(task);
    } catch (ex) {
      throw new Error('Failed to execute task.');
    } finally {
      const index = trackForTask.tasks.indexOf(taskIdentity);

      trackForTask.tasks.splice(index, 1);
    }
  }
}

module.exports = Course;

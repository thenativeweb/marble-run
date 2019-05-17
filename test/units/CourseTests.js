'use strict';

const assert = require('assertthat'),
      delay = require('delay');

const Course = require('../../src/Course');

suite('Course', () => {
  test('is a function.', async () => {
    assert.that(Course).is.ofType('function');
  });

  test('creates a new course with a trackCount of 256.', async () => {
    const course = new Course();

    assert.that(course.tracks.length).is.equalTo(256);
  });

  test('initializes each course with empty tasks.', async () => {
    const course = new Course();

    course.tracks.forEach(track => {
      assert.that(track.tasks.length).is.equalTo(0);
    });
  });

  suite('findBestTrackForRoutingKey', () => {
    test('is a function.', async () => {
      assert.that(Course.findBestTrackForRoutingKey).is.ofType('function');
    });

    test('throws an error when tracks are missing.', async () => {
      assert.that(() => {
        Course.findBestTrackForRoutingKey({});
      }).is.throwing('Tracks are missing.');
    });

    test('throws an error when routing key is missing.', async () => {
      assert.that(() => {
        Course.findBestTrackForRoutingKey({ tracks: []});
      }).is.throwing('Routing key is missing.');
    });

    test('returns first empty track when no work has been added yet.', async () => {
      const tracks = [
        { tasks: []},
        { tasks: []}
      ];

      const routingKey = '000000-0000-0000-0000-0000000000001';

      const track = Course.findBestTrackForRoutingKey({ tracks, routingKey });

      assert.that(tracks.indexOf(track)).is.equalTo(0);
    });

    test('returns the track for the given routing key when work has already been added for it.', async () => {
      const tracks = [
        { tasks: []},
        { tasks: [{ routingKey: '000000-0000-0000-0000-0000000000001' }]}
      ];

      const routingKey = '000000-0000-0000-0000-0000000000001';

      const track = Course.findBestTrackForRoutingKey({ tracks, routingKey });

      assert.that(tracks.indexOf(track)).is.equalTo(1);
    });

    test('returns the free track for the given routing key when no work has been added for it yet.', async () => {
      const tracks = [
        { tasks: [{ routingKey: '000000-0000-0000-0000-0000000000001' }]},
        { tasks: [{ routingKey: '000000-0000-0000-0000-0000000000002' }]},
        { tasks: []}
      ];

      const routingKey = '000000-0000-0000-0000-0000000000003';

      const track = Course.findBestTrackForRoutingKey({ tracks, routingKey });

      assert.that(tracks.indexOf(track)).is.equalTo(2);
    });

    test('returns the track with least todo count when all tracks have alredy work todo.', async () => {
      const tracks = [
        { tasks: [{ routingKey: '000000-0000-0000-0000-0000000000001' }, { routingKey: '000000-0000-0000-0000-0000000000002' }]},
        { tasks: [{ routingKey: '000000-0000-0000-0000-0000000000003' }]},
        { tasks: [{ routingKey: '000000-0000-0000-0000-0000000000004' }, { routingKey: '000000-0000-0000-0000-0000000000005' }]}
      ];

      const routingKey = '000000-0000-0000-0000-0000000000006';

      const track = Course.findBestTrackForRoutingKey({ tracks, routingKey });

      assert.that(tracks.indexOf(track)).is.equalTo(1);
    });
  });

  suite('add', () => {
    let course;

    setup(() => {
      course = new Course();
    });

    test('is a function.', async () => {
      assert.that(course.add).is.ofType('function');
    });

    test('throws an error if routing key is missing.', async () => {
      await assert.that(async () => {
        await course.add({});
      }).is.throwingAsync('Routing key is missing.');
    });

    test('throws an error if id is missing.', async () => {
      await assert.that(async () => {
        await course.add({ routingKey: '000000-0000-0000-0000-0000000000001' });
      }).is.throwingAsync('Id is missing.');
    });

    test('throws an error if task is missing.', async () => {
      await assert.that(async () => {
        await course.add({ routingKey: '000000-0000-0000-0000-0000000000001', id: '000000-0000-0000-0000-000000000000A' });
      }).is.throwingAsync('Task is missing.');
    });

    test('throws an error if task throws an error.', async () => {
      await assert.that(async () => {
        await course.add({
          routingKey: '000000-0000-0000-0000-0000000000001',
          id: '000000-0000-0000-0000-000000000000A',
          async task () {
            throw new Error('Something bad happened.');
          }
        });
      }).is.throwingAsync('Something bad happened.');
    });

    test('runs a task.', async () => {
      const callOrder = [];

      await course.add({
        routingKey: '000000-0000-0000-0000-0000000000001',
        id: '000000-0000-0000-0000-000000000000A',
        async task () {
          await delay(100);

          callOrder.push('000000-0000-0000-0000-000000000000A');
        }
      });

      assert.that(callOrder.length).is.equalTo(1);
    });

    test('runs tasks with the same routing key in series.', async () => {
      const callOrder = [];

      await Promise.all([
        course.add({
          routingKey: '000000-0000-0000-0000-0000000000001',
          id: '000000-0000-0000-0000-000000000000A',
          async task () {
            await delay(200);

            callOrder.push('000000-0000-0000-0000-000000000000A');
          }
        }),
        course.add({
          routingKey: '000000-0000-0000-0000-0000000000001',
          id: '000000-0000-0000-0000-000000000000B',
          async task () {
            await delay(100);

            callOrder.push('000000-0000-0000-0000-000000000000B');
          }
        })
      ]);

      assert.that(callOrder.length).is.equalTo(2);
      assert.that(callOrder[0]).is.equalTo('000000-0000-0000-0000-000000000000A');
      assert.that(callOrder[1]).is.equalTo('000000-0000-0000-0000-000000000000B');
    });

    test('runs tasks for a different routing keys in parallel.', async () => {
      const callOrder = [];

      await Promise.all([
        course.add({
          routingKey: '000000-0000-0000-0000-0000000000001',
          id: '000000-0000-0000-0000-000000000000A',
          async task () {
            await delay(200);

            callOrder.push('000000-0000-0000-0000-000000000000A');
          }
        }),
        course.add({
          routingKey: '000000-0000-0000-0000-0000000000002',
          id: '000000-0000-0000-0000-000000000000B',
          async task () {
            await delay(100);

            callOrder.push('000000-0000-0000-0000-000000000000B');
          }
        })
      ]);

      assert.that(callOrder.length).is.equalTo(2);
      assert.that(callOrder[0]).is.equalTo('000000-0000-0000-0000-000000000000B');
      assert.that(callOrder[1]).is.equalTo('000000-0000-0000-0000-000000000000A');
    });

    test('removes the todo from track once the task is done.', async () => {
      await Promise.all([
        course.add({
          routingKey: '000000-0000-0000-0000-0000000000001',
          id: '000000-0000-0000-0000-000000000000A',
          async task () {
            await delay(200);
          }
        }),
        course.add({
          routingKey: '000000-0000-0000-0000-0000000000002',
          id: '000000-0000-0000-0000-000000000000B',
          async task () {
            await delay(100);
          }
        })
      ]);

      course.tracks.forEach(track => {
        assert.that(track.tasks.length).is.equalTo(0);
      });
    });

    test('removes the todo from track even when a task throws an error.', async () => {
      await assert.that(async () => {
        await course.add({
          routingKey: '000000-0000-0000-0000-0000000000001',
          id: '000000-0000-0000-0000-000000000000A',
          async task () {
            throw new Error();
          }
        });
      }).is.throwingAsync();

      course.tracks.forEach(track => {
        assert.that(track.tasks.length).is.equalTo(0);
      });
    });

    test('running tasks with the same id in parallel throws an error.', async () => {
      await assert.that(async () => Promise.all([
        course.add({
          routingKey: '000000-0000-0000-0000-0000000000001',
          id: '000000-0000-0000-0000-000000000000A',
          async task () {
            await delay(200);
          }
        }),
        course.add({
          routingKey: '000000-0000-0000-0000-0000000000002',
          id: '000000-0000-0000-0000-000000000000A',
          async task () {
            await delay(100);
          }
        })
      ])).is.throwingAsync();
    });
  });
});

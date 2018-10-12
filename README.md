# marble-run

marble-run is a module for parallelizing async tasks while keeping some of them in order.

![marble-run](images/logo.png "marble-run")

## Installation

```shell
$ npm install marble-run
```

## Quick start

First you need to add a reference to marble-run in your application.

```javascript
const Course = require('marble-run');
```

Create a new course that will serve as a dispatcher for your async tasks. By default a course will create 256 tracks. Each track can be filled with async tasks and will be run in series. The tracks will run in parallel.

```javascript
const course = new Course();
```

### Setting the track count

You can add more tracks by setting the `trackCount` option.

```javascript
const course = new Course({
  trackCount: 256
});
```

## Adding work & parallizing it via the routing key

In order to add async tasks you need to call the `add` method. Specify a v4 UUID as the `id` if this worker. Provide a v4 UUID as the `routingKey` parameter which will be used to dispatch work onto the tracks. A course will make sure that all tasks with the same `routingKey` will end up on the same track.

```javascript
// These functions will run in parallel
await Promise.all([
  course.add({
    routingKey: '000000-0000-0000-0000-0000000000001',
    id: 'b9031afc-bbc8-4e48-8fb0-5639a9afd8c2',
    worker: async function () {

    }
  }),
  course.add({
    routingKey: '000000-0000-0000-0000-0000000000002',
    id: 'f7175cf7-9bc4-40af-9583-6a5dcd7dda06',
    worker: async function () {

    }
  })
]);
console.log('All workers done!');

// These functions will run in series
await Promise.all([
  course.add({
    routingKey: '000000-0000-0000-0000-0000000000003',
    id: '364f4680-2771-4175-9b07-3c8a0cb9c135',
    worker: async function () {

    }
  }),
  course.add({
    routingKey: '000000-0000-0000-0000-0000000000003',
    id: 'f8c95949-78e2-4e41-8b7c-f8cdc606d1d1',
    worker: async function () {

    }
  })
]);
console.log('All workers done!');

```

## Running the build

To build this module use [roboter](https://www.npmjs.com/package/roboter).

```shell
$ npx roboter
```

## License

The MIT License (MIT)
Copyright (c) 2018 the native web.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

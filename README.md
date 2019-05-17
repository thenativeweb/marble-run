# marble-run

marble-run parallelizes asynchronous tasks while keeping some of them in order.

![marble-run](images/logo.png "marble-run")

## Installation

```shell
$ npm install marble-run
```

## Quick start

First you need to add a reference to marble-run in your application:

```javascript
const Course = require('marble-run');
```

Then, create a new course that will serve as a dispatcher for your async tasks. By default a course will create 256 tracks. Each track can be filled with async tasks that will be run in series. The tracks themselves will run in parallel:

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

## Adding work and parallelizing it via the routing key

In order to add async tasks you need to call the `add` method. First of all, you need to specify an `id` for the task, and a `task` function to handle the task. Adding multiple tasks with the same `id` throws an error to prevent accidentally adding the same task multiple times.

Also, you need to provide a `routingKey`. This key will be used to dispatch tasks onto the various tracks. A course will try to balance tasks between tracks, but make sure that all tasks with the same `routingKey` end up on the same track (i.e. are run sequantially):

```javascript
course.add({
  routingKey: '5d34dc92-899d-47dd-a51d-80c9379320c0',
  id: 'b9031afc-bbc8-4e48-8fb0-5639a9afd8c2',
  async task () {
    // ...
  }
});
```

If you want to get notified once a task ends, you can `await` its result:

```javascript
await course.add({
  routingKey: '5d34dc92-899d-47dd-a51d-80c9379320c0',
  id: 'b9031afc-bbc8-4e48-8fb0-5639a9afd8c2',
  async task () {
    // ...
  }
});
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

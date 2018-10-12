'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var PQueue = require('p-queue');

var Course =
/*#__PURE__*/
function () {
  function Course() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$trackCount = _ref.trackCount,
        trackCount = _ref$trackCount === void 0 ? 256 : _ref$trackCount,
        _ref$concurrencyPerTr = _ref.concurrencyPerTrack,
        concurrencyPerTrack = _ref$concurrencyPerTr === void 0 ? 1 : _ref$concurrencyPerTr;

    (0, _classCallCheck2.default)(this, Course);
    this.tracks = [];

    for (var i = 0; i < trackCount; i++) {
      this.tracks[i] = {
        tasks: [],
        queue: new PQueue({
          concurrency: concurrencyPerTrack
        })
      };
    }
  }

  (0, _createClass2.default)(Course, [{
    key: "add",
    value: function () {
      var _add = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee() {
        var _ref2,
            routingKey,
            id,
            task,
            trackForTask,
            taskIdentity,
            index,
            _args = arguments;

        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _ref2 = _args.length > 0 && _args[0] !== undefined ? _args[0] : {}, routingKey = _ref2.routingKey, id = _ref2.id, task = _ref2.task;

                if (routingKey) {
                  _context.next = 3;
                  break;
                }

                throw new Error('Routing key is missing.');

              case 3:
                if (id) {
                  _context.next = 5;
                  break;
                }

                throw new Error('Id is missing.');

              case 5:
                if (task) {
                  _context.next = 7;
                  break;
                }

                throw new Error('Task is missing.');

              case 7:
                if (!(typeof task !== 'function')) {
                  _context.next = 9;
                  break;
                }

                throw new Error('Task is not a function.');

              case 9:
                trackForTask = Course.findBestTrackForRoutingKey({
                  tracks: this.tracks,
                  routingKey: routingKey
                });
                taskIdentity = {
                  routingKey: routingKey,
                  id: id
                };
                trackForTask.tasks.push(taskIdentity);
                _context.prev = 12;
                _context.next = 15;
                return trackForTask.queue.add(task);

              case 15:
                _context.next = 20;
                break;

              case 17:
                _context.prev = 17;
                _context.t0 = _context["catch"](12);
                throw new Error('Failed to execute task.');

              case 20:
                _context.prev = 20;
                index = trackForTask.tasks.indexOf(taskIdentity);
                trackForTask.tasks.splice(index, 1);
                return _context.finish(20);

              case 24:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[12, 17, 20, 24]]);
      }));

      return function add() {
        return _add.apply(this, arguments);
      };
    }()
  }], [{
    key: "findBestTrackForRoutingKey",
    value: function findBestTrackForRoutingKey() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          tracks = _ref3.tracks,
          routingKey = _ref3.routingKey;

      if (!tracks) {
        throw new Error('Tracks are missing.');
      }

      if (!routingKey) {
        throw new Error('Routing key is missing.');
      }

      var existingTrackForKey = tracks.find(function (track) {
        return track.tasks.find(function (task) {
          return task.routingKey === routingKey;
        });
      });

      if (existingTrackForKey) {
        return existingTrackForKey;
      }

      var freeTrack = tracks.find(function (track) {
        return track.tasks.length === 0;
      });

      if (freeTrack) {
        return freeTrack;
      } // Slice the original array in order not to mutate it via sort.


      var tracksSortedByTodos = tracks.slice().sort(function (firstTrack, secondTrack) {
        return firstTrack.tasks.length - secondTrack.tasks.length;
      });
      return tracksSortedByTodos[0];
    }
  }]);
  return Course;
}();

module.exports = Course;
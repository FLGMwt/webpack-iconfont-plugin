'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeify = require('nodeify');

var _nodeify2 = _interopRequireDefault(_nodeify);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _globParent = require('glob-parent');

var _globParent2 = _interopRequireDefault(_globParent);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _generator = require('./generator');

var _generator2 = _interopRequireDefault(_generator);

var _hasha = require('hasha');

var _hasha2 = _interopRequireDefault(_hasha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IconfontPlugin = function () {
  function IconfontPlugin() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, IconfontPlugin);

    var required = ['svgs', 'fonts', 'styles'];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = required[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var r = _step.value;

        if (!options[r]) {
          throw new Error('Require \'' + r + '\' option');
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    this.options = Object.assign({}, options);
    this.fileDependencies = [];
    this.hashes = {};

    this.compile = this.compile.bind(this);
    this.watch = this.watch.bind(this);
  }

  _createClass(IconfontPlugin, [{
    key: 'apply',
    value: function apply(compiler) {
      compiler.plugin('run', this.compile);
      compiler.plugin('watch-run', this.compile);
      compiler.plugin('after-emit', this.watch);
    }
  }, {
    key: 'compile',
    value: function compile(compilation, callback) {
      var _this = this;

      var options = this.options;

      return (0, _nodeify2.default)((0, _generator2.default)(options).then(function (result) {
        var fontName = result.config.fontName;

        var destStyles = null;

        if (result.styles) {
          destStyles = _path2.default.resolve(_this.options.styles);
        }

        return Promise.all(Object.keys(result).map(function (type) {
          if (type === 'config' || type === 'usedBuildInStylesTemplate') {
            return Promise.resolve();
          }

          var content = result[type];
          var hash = (0, _hasha2.default)(content);
          var destFilename = null;

          if (type !== 'styles') {
            destFilename = _path2.default.resolve(_path2.default.join(_this.options.fonts, fontName + '.' + type));
          } else {
            destFilename = _path2.default.resolve(destStyles);
          }

          if (_this.hashes[destFilename] !== hash) {
            _this.hashes[destFilename] = hash;
            return new Promise(function (resolve, reject) {
              _fsExtra2.default.outputFile(destFilename, content, function (error) {
                if (error) {
                  return reject(new Error(error));
                }
                return resolve();
              });
            });
          }
        }));
      }), function (error) {
        return callback(error);
      });
    }
  }, {
    key: 'watch',
    value: function watch(compilation, callback) {
      var globPatterns = typeof this.options.svgs === 'string' ? [this.options.svgs] : this.options.svgs;

      globPatterns.forEach(function (globPattern) {
        var context = (0, _globParent2.default)(globPattern);
        if (compilation.contextDependencies.indexOf(context) === -1) {
          compilation.contextDependencies.push(context);
        }
      });

      return callback();
    }
  }]);

  return IconfontPlugin;
}();

exports.default = IconfontPlugin;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJJY29uZm9udFBsdWdpbiIsIm9wdGlvbnMiLCJyZXF1aXJlZCIsInIiLCJFcnJvciIsIk9iamVjdCIsImFzc2lnbiIsImZpbGVEZXBlbmRlbmNpZXMiLCJoYXNoZXMiLCJjb21waWxlIiwiYmluZCIsIndhdGNoIiwiY29tcGlsZXIiLCJwbHVnaW4iLCJjb21waWxhdGlvbiIsImNhbGxiYWNrIiwidGhlbiIsImZvbnROYW1lIiwicmVzdWx0IiwiY29uZmlnIiwiZGVzdFN0eWxlcyIsInN0eWxlcyIsInJlc29sdmUiLCJQcm9taXNlIiwiYWxsIiwia2V5cyIsIm1hcCIsInR5cGUiLCJjb250ZW50IiwiaGFzaCIsImRlc3RGaWxlbmFtZSIsImpvaW4iLCJmb250cyIsInJlamVjdCIsIm91dHB1dEZpbGUiLCJlcnJvciIsImdsb2JQYXR0ZXJucyIsInN2Z3MiLCJmb3JFYWNoIiwiY29udGV4dCIsImdsb2JQYXR0ZXJuIiwiY29udGV4dERlcGVuZGVuY2llcyIsImluZGV4T2YiLCJwdXNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7SUFFcUJBLGM7QUFDbkIsNEJBQTBCO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUFBOztBQUN4QixRQUFNQyxXQUFXLENBQUMsTUFBRCxFQUFTLE9BQVQsRUFBa0IsUUFBbEIsQ0FBakI7O0FBRHdCO0FBQUE7QUFBQTs7QUFBQTtBQUd4QiwyQkFBY0EsUUFBZCw4SEFBd0I7QUFBQSxZQUFmQyxDQUFlOztBQUN0QixZQUFJLENBQUNGLFFBQVFFLENBQVIsQ0FBTCxFQUFpQjtBQUNmLGdCQUFNLElBQUlDLEtBQUosZ0JBQXNCRCxDQUF0QixlQUFOO0FBQ0Q7QUFDRjtBQVB1QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVN4QixTQUFLRixPQUFMLEdBQWVJLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCTCxPQUFsQixDQUFmO0FBQ0EsU0FBS00sZ0JBQUwsR0FBd0IsRUFBeEI7QUFDQSxTQUFLQyxNQUFMLEdBQWMsRUFBZDs7QUFFQSxTQUFLQyxPQUFMLEdBQWUsS0FBS0EsT0FBTCxDQUFhQyxJQUFiLENBQWtCLElBQWxCLENBQWY7QUFDQSxTQUFLQyxLQUFMLEdBQWEsS0FBS0EsS0FBTCxDQUFXRCxJQUFYLENBQWdCLElBQWhCLENBQWI7QUFDRDs7OzswQkFFS0UsUSxFQUFVO0FBQ2RBLGVBQVNDLE1BQVQsQ0FBZ0IsS0FBaEIsRUFBdUIsS0FBS0osT0FBNUI7QUFDQUcsZUFBU0MsTUFBVCxDQUFnQixXQUFoQixFQUE2QixLQUFLSixPQUFsQztBQUNBRyxlQUFTQyxNQUFULENBQWdCLFlBQWhCLEVBQThCLEtBQUtGLEtBQW5DO0FBQ0Q7Ozs0QkFFT0csVyxFQUFhQyxRLEVBQVU7QUFBQTs7QUFBQSxVQUNyQmQsT0FEcUIsR0FDVCxJQURTLENBQ3JCQSxPQURxQjs7QUFFN0IsYUFBTyx1QkFDTCx5QkFBU0EsT0FBVCxFQUFrQmUsSUFBbEIsQ0FBdUIsa0JBQVU7QUFBQSxZQUNyQkMsUUFEcUIsR0FDUkMsT0FBT0MsTUFEQyxDQUNyQkYsUUFEcUI7O0FBRTdCLFlBQUlHLGFBQWEsSUFBakI7O0FBRUEsWUFBSUYsT0FBT0csTUFBWCxFQUFtQjtBQUNmRCx1QkFBYSxlQUFLRSxPQUFMLENBQWEsTUFBS3JCLE9BQUwsQ0FBYW9CLE1BQTFCLENBQWI7QUFDSDs7QUFFRCxlQUFPRSxRQUFRQyxHQUFSLENBQ0huQixPQUFPb0IsSUFBUCxDQUFZUCxNQUFaLEVBQW9CUSxHQUFwQixDQUF3QixnQkFBUTtBQUM1QixjQUNJQyxTQUFTLFFBQVQsSUFDQUEsU0FBUywyQkFGYixFQUdFO0FBQ0UsbUJBQU9KLFFBQVFELE9BQVIsRUFBUDtBQUNIOztBQUVELGNBQU1NLFVBQVVWLE9BQU9TLElBQVAsQ0FBaEI7QUFDQSxjQUFNRSxPQUFPLHFCQUFNRCxPQUFOLENBQWI7QUFDQSxjQUFJRSxlQUFlLElBQW5COztBQUVBLGNBQUlILFNBQVMsUUFBYixFQUF1QjtBQUNuQkcsMkJBQWUsZUFBS1IsT0FBTCxDQUNYLGVBQUtTLElBQUwsQ0FBVSxNQUFLOUIsT0FBTCxDQUFhK0IsS0FBdkIsRUFBaUNmLFFBQWpDLFNBQTZDVSxJQUE3QyxDQURXLENBQWY7QUFHSCxXQUpELE1BSU87QUFDSEcsMkJBQWUsZUFBS1IsT0FBTCxDQUFhRixVQUFiLENBQWY7QUFDSDs7QUFFRCxjQUFJLE1BQUtaLE1BQUwsQ0FBWXNCLFlBQVosTUFBOEJELElBQWxDLEVBQXdDO0FBQ3RDLGtCQUFLckIsTUFBTCxDQUFZc0IsWUFBWixJQUE0QkQsSUFBNUI7QUFDQSxtQkFBTyxJQUFJTixPQUFKLENBQVksVUFBQ0QsT0FBRCxFQUFVVyxNQUFWLEVBQXFCO0FBQ3RDLGdDQUFHQyxVQUFILENBQWNKLFlBQWQsRUFBNEJGLE9BQTVCLEVBQXFDLGlCQUFTO0FBQzFDLG9CQUFJTyxLQUFKLEVBQVc7QUFDUCx5QkFBT0YsT0FBTyxJQUFJN0IsS0FBSixDQUFVK0IsS0FBVixDQUFQLENBQVA7QUFDSDtBQUNELHVCQUFPYixTQUFQO0FBQ0gsZUFMRDtBQU1ELGFBUE0sQ0FBUDtBQVFEO0FBRUosU0FoQ0QsQ0FERyxDQUFQO0FBbUNILE9BM0NELENBREssRUE2Q0w7QUFBQSxlQUFTUCxTQUFTb0IsS0FBVCxDQUFUO0FBQUEsT0E3Q0ssQ0FBUDtBQStDRDs7OzBCQUVLckIsVyxFQUFhQyxRLEVBQVU7QUFDM0IsVUFBTXFCLGVBQWUsT0FBTyxLQUFLbkMsT0FBTCxDQUFhb0MsSUFBcEIsS0FBNkIsUUFBN0IsR0FBd0MsQ0FBQyxLQUFLcEMsT0FBTCxDQUFhb0MsSUFBZCxDQUF4QyxHQUE4RCxLQUFLcEMsT0FBTCxDQUFhb0MsSUFBaEc7O0FBRUFELG1CQUFhRSxPQUFiLENBQXFCLHVCQUFlO0FBQ2xDLFlBQU1DLFVBQVUsMEJBQVdDLFdBQVgsQ0FBaEI7QUFDQSxZQUFJMUIsWUFBWTJCLG1CQUFaLENBQWdDQyxPQUFoQyxDQUF3Q0gsT0FBeEMsTUFBcUQsQ0FBQyxDQUExRCxFQUE2RDtBQUMzRHpCLHNCQUFZMkIsbUJBQVosQ0FBZ0NFLElBQWhDLENBQXFDSixPQUFyQztBQUNEO0FBQ0YsT0FMRDs7QUFPQSxhQUFPeEIsVUFBUDtBQUNEOzs7Ozs7a0JBdEZrQmYsYyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBub2RpZnkgZnJvbSAnbm9kZWlmeSc7XG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IGdsb2JQYXJlbnQgZnJvbSAnZ2xvYi1wYXJlbnQnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgaWNvbmZvbnQgZnJvbSAnLi9nZW5lcmF0b3InXG5pbXBvcnQgaGFzaGEgZnJvbSAnaGFzaGEnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJY29uZm9udFBsdWdpbiB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHJlcXVpcmVkID0gWydzdmdzJywgJ2ZvbnRzJywgJ3N0eWxlcyddO1xuXG4gICAgZm9yIChsZXQgciBvZiByZXF1aXJlZCkge1xuICAgICAgaWYgKCFvcHRpb25zW3JdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVxdWlyZSAnJHtyfScgb3B0aW9uYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucyk7XG4gICAgdGhpcy5maWxlRGVwZW5kZW5jaWVzID0gW107XG4gICAgdGhpcy5oYXNoZXMgPSB7fTtcblxuICAgIHRoaXMuY29tcGlsZSA9IHRoaXMuY29tcGlsZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMud2F0Y2ggPSB0aGlzLndhdGNoLmJpbmQodGhpcyk7XG4gIH1cblxuICBhcHBseShjb21waWxlcikge1xuICAgIGNvbXBpbGVyLnBsdWdpbigncnVuJywgdGhpcy5jb21waWxlKTtcbiAgICBjb21waWxlci5wbHVnaW4oJ3dhdGNoLXJ1bicsIHRoaXMuY29tcGlsZSk7XG4gICAgY29tcGlsZXIucGx1Z2luKCdhZnRlci1lbWl0JywgdGhpcy53YXRjaCk7XG4gIH1cblxuICBjb21waWxlKGNvbXBpbGF0aW9uLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IHsgb3B0aW9ucyB9ID0gdGhpcztcbiAgICByZXR1cm4gbm9kaWZ5KFxuICAgICAgaWNvbmZvbnQob3B0aW9ucykudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgZm9udE5hbWUgfSA9IHJlc3VsdC5jb25maWc7XG4gICAgICAgICAgbGV0IGRlc3RTdHlsZXMgPSBudWxsO1xuXG4gICAgICAgICAgaWYgKHJlc3VsdC5zdHlsZXMpIHtcbiAgICAgICAgICAgICAgZGVzdFN0eWxlcyA9IHBhdGgucmVzb2x2ZSh0aGlzLm9wdGlvbnMuc3R5bGVzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICAgIE9iamVjdC5rZXlzKHJlc3VsdCkubWFwKHR5cGUgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPT09ICdjb25maWcnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgdHlwZSA9PT0gJ3VzZWRCdWlsZEluU3R5bGVzVGVtcGxhdGUnXG4gICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSByZXN1bHRbdHlwZV07XG4gICAgICAgICAgICAgICAgICBjb25zdCBoYXNoID0gaGFzaGEoY29udGVudCk7XG4gICAgICAgICAgICAgICAgICBsZXQgZGVzdEZpbGVuYW1lID0gbnVsbDtcblxuICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgIT09ICdzdHlsZXMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgZGVzdEZpbGVuYW1lID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4odGhpcy5vcHRpb25zLmZvbnRzLCBgJHtmb250TmFtZX0uJHt0eXBlfWApXG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgZGVzdEZpbGVuYW1lID0gcGF0aC5yZXNvbHZlKGRlc3RTdHlsZXMpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZiAodGhpcy5oYXNoZXNbZGVzdEZpbGVuYW1lXSAhPT0gaGFzaCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhc2hlc1tkZXN0RmlsZW5hbWVdID0gaGFzaDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBmcy5vdXRwdXRGaWxlKGRlc3RGaWxlbmFtZSwgY29udGVudCwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKGVycm9yKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgfSksXG4gICAgICBlcnJvciA9PiBjYWxsYmFjayhlcnJvcilcbiAgICApO1xuICB9XG5cbiAgd2F0Y2goY29tcGlsYXRpb24sIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgZ2xvYlBhdHRlcm5zID0gdHlwZW9mIHRoaXMub3B0aW9ucy5zdmdzID09PSAnc3RyaW5nJyA/IFt0aGlzLm9wdGlvbnMuc3Znc10gOiB0aGlzLm9wdGlvbnMuc3ZncztcblxuICAgIGdsb2JQYXR0ZXJucy5mb3JFYWNoKGdsb2JQYXR0ZXJuID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBnbG9iUGFyZW50KGdsb2JQYXR0ZXJuKTtcbiAgICAgIGlmIChjb21waWxhdGlvbi5jb250ZXh0RGVwZW5kZW5jaWVzLmluZGV4T2YoY29udGV4dCkgPT09IC0xKSB7XG4gICAgICAgIGNvbXBpbGF0aW9uLmNvbnRleHREZXBlbmRlbmNpZXMucHVzaChjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9XG59XG4iXX0=
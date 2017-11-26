'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (initialOptions) {
  var options = Object.assign({}, {
    ascent: undefined,
    centerHorizontally: false,
    cssFontPath: '/static/fonts/',
    descent: 0,
    fixedWidth: false,
    fontHeight: null,
    fontId: null,
    fontName: 'iconfont',
    fontStyle: '',
    fontWeight: '',
    formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
    formatsOptions: {
      ttf: {
        copyright: null,
        ts: null,
        version: null
      }
    },
    glyphTransformFn: null,
    maxConcurrency: _os2.default.cpus().length,
    mergeDuplicates: false,
    metadata: null,
    metadataProvider: null,
    normalize: false,
    prependUnicode: false,
    round: 10e12,
    startUnicode: 0xEA01,
    template: 'scss',
    verbose: false
  }, initialOptions);
  var svgs = options.svgs;

  var glyphsData = [];

  return (0, _globby2.default)([].concat(svgs)).then(function (foundFiles) {
    var filteredFiles = [];
    foundFiles.forEach(function (foundFile) {
      if (_path2.default.extname(foundFile) !== '.svg') return;
      if (options.mergeDuplicates) {
        var index = filteredFiles.findIndex(function (item) {
          return _path2.default.basename(foundFile) === _path2.default.basename(item);
        });
        if (index !== -1) {
          filteredFiles[index] = foundFile;
          return;
        }
      }
      filteredFiles.push(foundFile);
    });

    if (filteredFiles.length === 0) {
      throw new Error('Iconfont glob patterns specified did not match any svgs');
    }

    options.foundFiles = filteredFiles;
    return getGlyphsData(filteredFiles, options);
  }).then(function (returnedGlyphsData) {
    glyphsData = returnedGlyphsData;
    return svgIcons2svgFontFn(returnedGlyphsData, options);
  }).then(function (svgFont) {
    var result = {};
    result.svg = svgFont;
    result.ttf = Buffer.from((0, _svg2ttf2.default)(result.svg.toString(), options.formatsOptions && options.formatsOptions.ttf ? options.formatsOptions.ttf : {}).buffer);

    if (options.formats.indexOf('eot') !== -1) {
      result.eot = Buffer.from((0, _ttf2eot2.default)(result.ttf).buffer);
    }

    if (options.formats.indexOf('woff') !== -1) {
      result.woff = Buffer.from((0, _ttf2woff2.default)(result.ttf, {
        metadata: options.metadata
      }).buffer);
    }

    if (options.formats.indexOf('woff2') !== -1) {
      result.woff2 = (0, _ttf2woff4.default)(result.ttf);
    }

    return result;
  }).then(function (result) {

    var buildInTemplateDirectory = _path2.default.resolve(__dirname, './templates');

    return (0, _globby2.default)(buildInTemplateDirectory + '/**/*').then(function (buildInTemplates) {
      var supportedExtensions = buildInTemplates.map(function (buildInTemplate) {
        return _path2.default.extname(buildInTemplate.replace('.njk', ''));
      });

      var templateFilePath = options.template;

      if (supportedExtensions.indexOf('.' + options.template) !== -1) {
        result.usedBuildInStylesTemplate = true;
        _nunjucks2.default.configure(_path2.default.join(__dirname, '../'));
        templateFilePath = buildInTemplateDirectory + '/template.' + options.template + '.njk';
      } else {
        templateFilePath = _path2.default.resolve(templateFilePath);
      }

      var nunjucksOptions = Object.assign({}, {
        glyphs: glyphsData.map(function (glyphData) {
          if (typeof options.glyphTransformFn === 'function') {
            options.glyphTransformFn(glyphData.metadata);
          }
          return glyphData.metadata;
        })
      }, (0, _cloneDeep2.default)(options), {
        fontName: options.fontName,
        fontPath: options.cssFontPath
      });
      result.styles = _nunjucks2.default.render(templateFilePath, nunjucksOptions);
      return result;
    }).then(function (result) {
      if (options.formats.indexOf('svg') === -1) {
        delete result.svg;
      }

      if (options.formats.indexOf('ttf') === -1) {
        delete result.ttf;
      }
      result.config = options;
      return result;
    });
  });
};

var _cloneDeep = require('clone-deep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _asyncThrottle = require('async-throttle');

var _asyncThrottle2 = _interopRequireDefault(_asyncThrottle);

var _metadata = require('svgicons2svgfont/src/metadata');

var _metadata2 = _interopRequireDefault(_metadata);

var _filesorter = require('svgicons2svgfont/src/filesorter');

var _filesorter2 = _interopRequireDefault(_filesorter);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _nunjucks = require('nunjucks');

var _nunjucks2 = _interopRequireDefault(_nunjucks);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _stream = require('stream');

var _svgicons2svgfont = require('svgicons2svgfont');

var _svgicons2svgfont2 = _interopRequireDefault(_svgicons2svgfont);

var _svg2ttf = require('svg2ttf');

var _svg2ttf2 = _interopRequireDefault(_svg2ttf);

var _ttf2eot = require('ttf2eot');

var _ttf2eot2 = _interopRequireDefault(_ttf2eot);

var _ttf2woff = require('ttf2woff');

var _ttf2woff2 = _interopRequireDefault(_ttf2woff);

var _ttf2woff3 = require('ttf2woff2');

var _ttf2woff4 = _interopRequireDefault(_ttf2woff3);

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getGlyphsData(files, options) {
  var metadataProvider = options.metadataProvider || (0, _metadata2.default)({
    prependUnicode: options.prependUnicode,
    startUnicode: options.startUnicode
  });

  var sortedFiles = files.sort(function (fileA, fileB) {
    return (0, _filesorter2.default)(fileA, fileB);
  });
  var xmlParser = new _xml2js2.default.Parser();
  var throttle = (0, _asyncThrottle2.default)(options.maxConcurrency);

  return Promise.all(sortedFiles.map(function (srcPath) {
    return throttle(function () {
      return new Promise(function (resolve, reject) {
        var glyph = _fs2.default.createReadStream(srcPath);
        var glyphContents = '';

        return glyph.on('error', function (glyphError) {
          return reject(glyphError);
        }).on('data', function (data) {
          glyphContents += data.toString();
        }).on('end', function () {
          if (glyphContents.length === 0) {
            return reject(new Error('Empty file ' + srcPath));
          }

          return xmlParser.parseString(glyphContents, function (error) {
            if (error) {
              return reject(error);
            }

            var glyphData = {
              contents: glyphContents,
              srcPath: srcPath
            };

            return resolve(glyphData);
          });
        });
      });
    }).then(function (glyphData) {
      return new Promise(function (resolve, reject) {
        metadataProvider(glyphData.srcPath, function (error, metadata) {
          if (error) {
            return reject(error);
          }
          glyphData.metadata = metadata;
          return resolve(glyphData);
        });
      });
    });
  }));
}

function svgIcons2svgFontFn(glyphsData, options) {
  var result = '';

  return new Promise(function (resolve, reject) {
    var fontStream = (0, _svgicons2svgfont2.default)({
      ascent: options.ascent,
      centerHorizontally: options.centerHorizontally,
      descent: options.descent,
      fixedWidth: options.fixedWidth,
      fontHeight: options.fontHeight,
      fontId: options.fontId,
      fontName: options.fontName,
      fontStyle: options.fontStyle,
      fontWeight: options.fontWeight,
      // eslint-disable-next-line no-console, no-empty-function
      log: options.vebose ? console.log.bind(console) : function () {},
      metadata: options.metadata,
      normalize: options.normalize,
      round: options.round
    }).on('finish', function () {
      return resolve(result);
    }).on('data', function (data) {
      result += data;
    }).on('error', function (error) {
      return reject(error);
    });

    glyphsData.forEach(function (glyphData) {
      var glyphStream = new _stream.Readable();

      glyphStream.push(glyphData.contents);
      glyphStream.push(null);

      glyphStream.metadata = glyphData.metadata;

      fontStream.write(glyphStream);
    });

    fontStream.end();
  });
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nZW5lcmF0b3IuanMiXSwibmFtZXMiOlsiaW5pdGlhbE9wdGlvbnMiLCJvcHRpb25zIiwiT2JqZWN0IiwiYXNzaWduIiwiYXNjZW50IiwidW5kZWZpbmVkIiwiY2VudGVySG9yaXpvbnRhbGx5IiwiY3NzRm9udFBhdGgiLCJkZXNjZW50IiwiZml4ZWRXaWR0aCIsImZvbnRIZWlnaHQiLCJmb250SWQiLCJmb250TmFtZSIsImZvbnRTdHlsZSIsImZvbnRXZWlnaHQiLCJmb3JtYXRzIiwiZm9ybWF0c09wdGlvbnMiLCJ0dGYiLCJjb3B5cmlnaHQiLCJ0cyIsInZlcnNpb24iLCJnbHlwaFRyYW5zZm9ybUZuIiwibWF4Q29uY3VycmVuY3kiLCJjcHVzIiwibGVuZ3RoIiwibWVyZ2VEdXBsaWNhdGVzIiwibWV0YWRhdGEiLCJtZXRhZGF0YVByb3ZpZGVyIiwibm9ybWFsaXplIiwicHJlcGVuZFVuaWNvZGUiLCJyb3VuZCIsInN0YXJ0VW5pY29kZSIsInRlbXBsYXRlIiwidmVyYm9zZSIsInN2Z3MiLCJnbHlwaHNEYXRhIiwiY29uY2F0IiwidGhlbiIsImZpbHRlcmVkRmlsZXMiLCJmb3VuZEZpbGVzIiwiZm9yRWFjaCIsImV4dG5hbWUiLCJmb3VuZEZpbGUiLCJpbmRleCIsImZpbmRJbmRleCIsImJhc2VuYW1lIiwiaXRlbSIsInB1c2giLCJFcnJvciIsImdldEdseXBoc0RhdGEiLCJyZXR1cm5lZEdseXBoc0RhdGEiLCJzdmdJY29uczJzdmdGb250Rm4iLCJyZXN1bHQiLCJzdmciLCJzdmdGb250IiwiQnVmZmVyIiwiZnJvbSIsInRvU3RyaW5nIiwiYnVmZmVyIiwiaW5kZXhPZiIsImVvdCIsIndvZmYiLCJ3b2ZmMiIsImJ1aWxkSW5UZW1wbGF0ZURpcmVjdG9yeSIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJzdXBwb3J0ZWRFeHRlbnNpb25zIiwiYnVpbGRJblRlbXBsYXRlcyIsIm1hcCIsImJ1aWxkSW5UZW1wbGF0ZSIsInJlcGxhY2UiLCJ0ZW1wbGF0ZUZpbGVQYXRoIiwidXNlZEJ1aWxkSW5TdHlsZXNUZW1wbGF0ZSIsImNvbmZpZ3VyZSIsImpvaW4iLCJudW5qdWNrc09wdGlvbnMiLCJnbHlwaHMiLCJnbHlwaERhdGEiLCJmb250UGF0aCIsInN0eWxlcyIsInJlbmRlciIsImNvbmZpZyIsImZpbGVzIiwic29ydGVkRmlsZXMiLCJzb3J0IiwiZmlsZUEiLCJmaWxlQiIsInhtbFBhcnNlciIsIlBhcnNlciIsInRocm90dGxlIiwiUHJvbWlzZSIsImFsbCIsInJlamVjdCIsImdseXBoIiwiY3JlYXRlUmVhZFN0cmVhbSIsInNyY1BhdGgiLCJnbHlwaENvbnRlbnRzIiwib24iLCJnbHlwaEVycm9yIiwiZGF0YSIsInBhcnNlU3RyaW5nIiwiZXJyb3IiLCJjb250ZW50cyIsImZvbnRTdHJlYW0iLCJsb2ciLCJ2ZWJvc2UiLCJjb25zb2xlIiwiYmluZCIsImdseXBoU3RyZWFtIiwid3JpdGUiLCJlbmQiXSwibWFwcGluZ3MiOiI7Ozs7OztrQkE4SGUsVUFBU0EsY0FBVCxFQUF5QjtBQUN0QyxNQUFJQyxVQUFVQyxPQUFPQyxNQUFQLENBQ1osRUFEWSxFQUVaO0FBQ0VDLFlBQVFDLFNBRFY7QUFFRUMsd0JBQW9CLEtBRnRCO0FBR0VDLGlCQUFhLGdCQUhmO0FBSUVDLGFBQVMsQ0FKWDtBQUtFQyxnQkFBWSxLQUxkO0FBTUVDLGdCQUFZLElBTmQ7QUFPRUMsWUFBUSxJQVBWO0FBUUVDLGNBQVUsVUFSWjtBQVNFQyxlQUFXLEVBVGI7QUFVRUMsZ0JBQVksRUFWZDtBQVdFQyxhQUFTLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxLQUFmLEVBQXNCLE1BQXRCLEVBQThCLE9BQTlCLENBWFg7QUFZRUMsb0JBQWdCO0FBQ2RDLFdBQUs7QUFDSEMsbUJBQVcsSUFEUjtBQUVIQyxZQUFJLElBRkQ7QUFHSEMsaUJBQVM7QUFITjtBQURTLEtBWmxCO0FBbUJFQyxzQkFBa0IsSUFuQnBCO0FBb0JFQyxvQkFBZ0IsYUFBR0MsSUFBSCxHQUFVQyxNQXBCNUI7QUFxQkVD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QkFsRSxlQUFXSyxPQUFYLENBQW1CLHFCQUFhO0FBQzlCLFVBQU1vRSxjQUFjLHNCQUFwQjs7QUFFQUEsa0JBQVk3RCxJQUFaLENBQWlCOEIsVUFBVXlCLFFBQTNCO0FBQ0FNLGtCQUFZN0QsSUFBWixDQUFpQixJQUFqQjs7QUFFQTZELGtCQUFZbEYsUUFBWixHQUF1Qm1ELFVBQVVuRCxRQUFqQzs7QUFFQTZFLGlCQUFXTSxLQUFYLENBQWlCRCxXQUFqQjtBQUNELEtBVEQ7O0FBV0FMLGVBQVdPLEdBQVg7QUFDRCxHQW5DTSxDQUFQO0FBb0NEIiwiZmlsZSI6ImdlbmVyYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjbG9uZURlZXAgZnJvbSAnY2xvbmUtZGVlcCc7XG5pbXBvcnQgY3JlYXRlVGhyb3R0bGUgZnJvbSAnYXN5bmMtdGhyb3R0bGUnO1xuaW1wb3J0IGRlZmF1bHRNZXRhZGF0YVByb3ZpZGVyIGZyb20gJ3N2Z2ljb25zMnN2Z2ZvbnQvc3JjL21ldGFkYXRhJztcbmltcG9ydCBmaWxlU29ydGVyIGZyb20gJ3N2Z2ljb25zMnN2Z2ZvbnQvc3JjL2ZpbGVzb3J0ZXInO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBnbG9iYnkgZnJvbSAnZ2xvYmJ5JztcbmltcG9ydCBudW5qdWNrcyBmcm9tICdudW5qdWNrcyc7XG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1JlYWRhYmxlfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IHN2Z2ljb25zMnN2Z2ZvbnQgZnJvbSAnc3ZnaWNvbnMyc3ZnZm9udCc7XG5pbXBvcnQgc3ZnMnR0ZiBmcm9tICdzdmcydHRmJztcbmltcG9ydCB0dGYyZW90IGZyb20gJ3R0ZjJlb3QnO1xuaW1wb3J0IHR0ZjJ3b2ZmIGZyb20gJ3R0ZjJ3b2ZmJztcbmltcG9ydCB0dGYyd29mZjIgZnJvbSAndHRmMndvZmYyJztcbmltcG9ydCB4bWwyanMgZnJvbSAneG1sMmpzJztcblxuZnVuY3Rpb24gZ2V0R2x5cGhzRGF0YShmaWxlcywgb3B0aW9ucykge1xuICBjb25zdCBtZXRhZGF0YVByb3ZpZGVyID1cbiAgICBvcHRpb25zLm1ldGFkYXRhUHJvdmlkZXIgfHxcbiAgICBkZWZhdWx0TWV0YWRhdGFQcm92aWRlcih7XG4gICAgICBwcmVwZW5kVW5pY29kZTogb3B0aW9ucy5wcmVwZW5kVW5pY29kZSxcbiAgICAgIHN0YXJ0VW5pY29kZTogb3B0aW9ucy5zdGFydFVuaWNvZGVcbiAgICB9KTtcblxuICBjb25zdCBzb3J0ZWRGaWxlcyA9IGZpbGVzLnNvcnQoKGZpbGVBLCBmaWxlQikgPT4gZmlsZVNvcnRlcihmaWxlQSwgZmlsZUIpKTtcbiAgY29uc3QgeG1sUGFyc2VyID0gbmV3IHhtbDJqcy5QYXJzZXIoKTtcbiAgY29uc3QgdGhyb3R0bGUgPSBjcmVhdGVUaHJvdHRsZShvcHRpb25zLm1heENvbmN1cnJlbmN5KTtcblxuICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgc29ydGVkRmlsZXMubWFwKHNyY1BhdGggPT5cbiAgICAgIHRocm90dGxlKFxuICAgICAgICAoKSA9PlxuICAgICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdseXBoID0gZnMuY3JlYXRlUmVhZFN0cmVhbShzcmNQYXRoKTtcbiAgICAgICAgICAgICAgbGV0IGdseXBoQ29udGVudHMgPSAnJztcblxuICAgICAgICAgICAgICByZXR1cm4gZ2x5cGhcbiAgICAgICAgICAgICAgICAub24oJ2Vycm9yJywgZ2x5cGhFcnJvciA9PiByZWplY3QoZ2x5cGhFcnJvcikpXG4gICAgICAgICAgICAgICAgLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgICBnbHlwaENvbnRlbnRzICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGdseXBoQ29udGVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yKGBFbXB0eSBmaWxlICR7c3JjUGF0aH1gKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICByZXR1cm4geG1sUGFyc2VyLnBhcnNlU3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICBnbHlwaENvbnRlbnRzLFxuICAgICAgICAgICAgICAgICAgICBlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBnbHlwaERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50czogZ2x5cGhDb250ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyY1BhdGhcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZ2x5cGhEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICApLnRoZW4oXG4gICAgICAgIGdseXBoRGF0YSA9PlxuICAgICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGFkYXRhUHJvdmlkZXIoXG4gICAgICAgICAgICAgIGdseXBoRGF0YS5zcmNQYXRoLFxuICAgICAgICAgICAgICAoZXJyb3IsIG1ldGFkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ2x5cGhEYXRhLm1ldGFkYXRhID0gbWV0YWRhdGE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZ2x5cGhEYXRhKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KVxuICAgICAgKVxuICAgIClcbiAgKTtcbn1cblxuZnVuY3Rpb24gc3ZnSWNvbnMyc3ZnRm9udEZuKGdseXBoc0RhdGEsIG9wdGlvbnMpIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgZm9udFN0cmVhbSA9IHN2Z2ljb25zMnN2Z2ZvbnQoe1xuICAgICAgYXNjZW50OiBvcHRpb25zLmFzY2VudCxcbiAgICAgIGNlbnRlckhvcml6b250YWxseTogb3B0aW9ucy5jZW50ZXJIb3Jpem9udGFsbHksXG4gICAgICBkZXNjZW50OiBvcHRpb25zLmRlc2NlbnQsXG4gICAgICBmaXhlZFdpZHRoOiBvcHRpb25zLmZpeGVkV2lkdGgsXG4gICAgICBmb250SGVpZ2h0OiBvcHRpb25zLmZvbnRIZWlnaHQsXG4gICAgICBmb250SWQ6IG9wdGlvbnMuZm9udElkLFxuICAgICAgZm9udE5hbWU6IG9wdGlvbnMuZm9udE5hbWUsXG4gICAgICBmb250U3R5bGU6IG9wdGlvbnMuZm9udFN0eWxlLFxuICAgICAgZm9udFdlaWdodDogb3B0aW9ucy5mb250V2VpZ2h0LFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUsIG5vLWVtcHR5LWZ1bmN0aW9uXG4gICAgICBsb2c6IG9wdGlvbnMudmVib3NlID8gY29uc29sZS5sb2cuYmluZChjb25zb2xlKSA6ICgpID0+IHt9LFxuICAgICAgbWV0YWRhdGE6IG9wdGlvbnMubWV0YWRhdGEsXG4gICAgICBub3JtYWxpemU6IG9wdGlvbnMubm9ybWFsaXplLFxuICAgICAgcm91bmQ6IG9wdGlvbnMucm91bmRcbiAgICB9KVxuICAgIC5vbignZmluaXNoJywgKCkgPT4gcmVzb2x2ZShyZXN1bHQpKVxuICAgIC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICByZXN1bHQgKz0gZGF0YTtcbiAgICB9KVxuICAgIC5vbignZXJyb3InLCBlcnJvciA9PiByZWplY3QoZXJyb3IpKTtcblxuICAgIGdseXBoc0RhdGEuZm9yRWFjaChnbHlwaERhdGEgPT4ge1xuICAgICAgY29uc3QgZ2x5cGhTdHJlYW0gPSBuZXcgUmVhZGFibGUoKTtcblxuICAgICAgZ2x5cGhTdHJlYW0ucHVzaChnbHlwaERhdGEuY29udGVudHMpO1xuICAgICAgZ2x5cGhTdHJlYW0ucHVzaChudWxsKTtcblxuICAgICAgZ2x5cGhTdHJlYW0ubWV0YWRhdGEgPSBnbHlwaERhdGEubWV0YWRhdGE7XG5cbiAgICAgIGZvbnRTdHJlYW0ud3JpdGUoZ2x5cGhTdHJlYW0pO1xuICAgIH0pO1xuXG4gICAgZm9udFN0cmVhbS5lbmQoKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluaXRpYWxPcHRpb25zKSB7XG4gIGxldCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICB7fSxcbiAgICB7XG4gICAgICBhc2NlbnQ6IHVuZGVmaW5lZCxcbiAgICAgIGNlbnRlckhvcml6b250YWxseTogZmFsc2UsXG4gICAgICBjc3NGb250UGF0aDogJy9zdGF0aWMvZm9udHMvJyxcbiAgICAgIGRlc2NlbnQ6IDAsXG4gICAgICBmaXhlZFdpZHRoOiBmYWxzZSxcbiAgICAgIGZvbnRIZWlnaHQ6IG51bGwsXG4gICAgICBmb250SWQ6IG51bGwsXG4gICAgICBmb250TmFtZTogJ2ljb25mb250JyxcbiAgICAgIGZvbnRTdHlsZTogJycsXG4gICAgICBmb250V2VpZ2h0OiAnJyxcbiAgICAgIGZvcm1hdHM6IFsnc3ZnJywgJ3R0ZicsICdlb3QnLCAnd29mZicsICd3b2ZmMiddLFxuICAgICAgZm9ybWF0c09wdGlvbnM6IHtcbiAgICAgICAgdHRmOiB7XG4gICAgICAgICAgY29weXJpZ2h0OiBudWxsLFxuICAgICAgICAgIHRzOiBudWxsLFxuICAgICAgICAgIHZlcnNpb246IG51bGxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdseXBoVHJhbnNmb3JtRm46IG51bGwsXG4gICAgICBtYXhDb25jdXJyZW5jeTogb3MuY3B1cygpLmxlbmd0aCxcbiAgICAgIG1lcmdlRHVwbGljYXRlczogZmFsc2UsXG4gICAgICBtZXRhZGF0YTogbnVsbCxcbiAgICAgIG1ldGFkYXRhUHJvdmlkZXI6IG51bGwsXG4gICAgICBub3JtYWxpemU6IGZhbHNlLFxuICAgICAgcHJlcGVuZFVuaWNvZGU6IGZhbHNlLFxuICAgICAgcm91bmQ6IDEwZTEyLFxuICAgICAgc3RhcnRVbmljb2RlOiAweEVBMDEsXG4gICAgICB0ZW1wbGF0ZTogJ3Njc3MnLFxuICAgICAgdmVyYm9zZTogZmFsc2VcbiAgICB9LFxuICAgIGluaXRpYWxPcHRpb25zXG4gICk7XG4gIGNvbnN0IHsgc3ZncyB9ID0gb3B0aW9ucztcbiAgbGV0IGdseXBoc0RhdGEgPSBbXTtcblxuICByZXR1cm4gKFxuICAgIGdsb2JieShbXS5jb25jYXQoc3ZncykpXG4gICAgLnRoZW4oZm91bmRGaWxlcyA9PiB7XG4gICAgICBjb25zdCBmaWx0ZXJlZEZpbGVzID0gW107XG4gICAgICBmb3VuZEZpbGVzLmZvckVhY2goZm91bmRGaWxlID0+IHtcbiAgICAgICAgaWYgKHBhdGguZXh0bmFtZShmb3VuZEZpbGUpICE9PSAnLnN2ZycpIHJldHVybjtcbiAgICAgICAgaWYgKG9wdGlvbnMubWVyZ2VEdXBsaWNhdGVzKSB7XG4gICAgICAgICAgdmFyIGluZGV4ID0gZmlsdGVyZWRGaWxlcy5maW5kSW5kZXgoaXRlbSA9PiBwYXRoLmJhc2VuYW1lKGZvdW5kRmlsZSkgPT09IHBhdGguYmFzZW5hbWUoaXRlbSkpO1xuICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIGZpbHRlcmVkRmlsZXNbaW5kZXhdID0gZm91bmRGaWxlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWx0ZXJlZEZpbGVzLnB1c2goZm91bmRGaWxlKTtcbiAgICAgIH0pXG5cbiAgICAgIGlmIChmaWx0ZXJlZEZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ0ljb25mb250IGdsb2IgcGF0dGVybnMgc3BlY2lmaWVkIGRpZCBub3QgbWF0Y2ggYW55IHN2Z3MnXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIG9wdGlvbnMuZm91bmRGaWxlcyA9IGZpbHRlcmVkRmlsZXM7XG4gICAgICByZXR1cm4gZ2V0R2x5cGhzRGF0YShmaWx0ZXJlZEZpbGVzLCBvcHRpb25zKTtcbiAgICB9KS50aGVuKHJldHVybmVkR2x5cGhzRGF0YSA9PiB7XG4gICAgICBnbHlwaHNEYXRhID0gcmV0dXJuZWRHbHlwaHNEYXRhO1xuICAgICAgcmV0dXJuIHN2Z0ljb25zMnN2Z0ZvbnRGbihyZXR1cm5lZEdseXBoc0RhdGEsIG9wdGlvbnMpO1xuICAgIH0pLnRoZW4oc3ZnRm9udCA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgIHJlc3VsdC5zdmcgPSBzdmdGb250O1xuICAgICAgcmVzdWx0LnR0ZiA9IEJ1ZmZlci5mcm9tKFxuICAgICAgICBzdmcydHRmKFxuICAgICAgICAgIHJlc3VsdC5zdmcudG9TdHJpbmcoKSxcbiAgICAgICAgICBvcHRpb25zLmZvcm1hdHNPcHRpb25zICYmIG9wdGlvbnMuZm9ybWF0c09wdGlvbnMudHRmXG4gICAgICAgICAgICA/IG9wdGlvbnMuZm9ybWF0c09wdGlvbnMudHRmXG4gICAgICAgICAgICA6IHt9XG4gICAgICAgICkuYnVmZmVyXG4gICAgICApO1xuXG4gICAgICBpZiAob3B0aW9ucy5mb3JtYXRzLmluZGV4T2YoJ2VvdCcpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQuZW90ID0gQnVmZmVyLmZyb20odHRmMmVvdChyZXN1bHQudHRmKS5idWZmZXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5mb3JtYXRzLmluZGV4T2YoJ3dvZmYnKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0LndvZmYgPSBCdWZmZXIuZnJvbShcbiAgICAgICAgICB0dGYyd29mZihyZXN1bHQudHRmLCB7XG4gICAgICAgICAgICBtZXRhZGF0YTogb3B0aW9ucy5tZXRhZGF0YVxuICAgICAgICAgIH0pLmJ1ZmZlclxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5mb3JtYXRzLmluZGV4T2YoJ3dvZmYyJykgIT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC53b2ZmMiA9IHR0ZjJ3b2ZmMihyZXN1bHQudHRmKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KS50aGVuKHJlc3VsdCA9PiB7XG5cbiAgICAgIGNvbnN0IGJ1aWxkSW5UZW1wbGF0ZURpcmVjdG9yeSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgX19kaXJuYW1lLFxuICAgICAgICAnLi90ZW1wbGF0ZXMnXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gZ2xvYmJ5KFxuICAgICAgICBgJHtidWlsZEluVGVtcGxhdGVEaXJlY3Rvcnl9LyoqLypgXG4gICAgICApLnRoZW4oYnVpbGRJblRlbXBsYXRlcyA9PiB7XG4gICAgICAgIGNvbnN0IHN1cHBvcnRlZEV4dGVuc2lvbnMgPSBidWlsZEluVGVtcGxhdGVzLm1hcChcbiAgICAgICAgICBidWlsZEluVGVtcGxhdGUgPT5cbiAgICAgICAgICAgIHBhdGguZXh0bmFtZShcbiAgICAgICAgICAgICAgYnVpbGRJblRlbXBsYXRlLnJlcGxhY2UoJy5uamsnLCAnJylcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgdGVtcGxhdGVGaWxlUGF0aCA9IG9wdGlvbnMudGVtcGxhdGU7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHN1cHBvcnRlZEV4dGVuc2lvbnMuaW5kZXhPZihcbiAgICAgICAgICAgIGAuJHtvcHRpb25zLnRlbXBsYXRlfWBcbiAgICAgICAgICApICE9PSAtMVxuICAgICAgICApIHtcbiAgICAgICAgICByZXN1bHQudXNlZEJ1aWxkSW5TdHlsZXNUZW1wbGF0ZSA9IHRydWU7XG4gICAgICAgICAgbnVuanVja3MuY29uZmlndXJlKHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8nKSk7XG4gICAgICAgICAgdGVtcGxhdGVGaWxlUGF0aCA9IGAke2J1aWxkSW5UZW1wbGF0ZURpcmVjdG9yeX0vdGVtcGxhdGUuJHtvcHRpb25zLnRlbXBsYXRlfS5uamtgO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGVtcGxhdGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZSh0ZW1wbGF0ZUZpbGVQYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG51bmp1Y2tzT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAge30sXG4gICAgICAgICAge1xuICAgICAgICAgICAgZ2x5cGhzOiBnbHlwaHNEYXRhLm1hcChnbHlwaERhdGEgPT4ge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuZ2x5cGhUcmFuc2Zvcm1GbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZ2x5cGhUcmFuc2Zvcm1GbihcbiAgICAgICAgICAgICAgICAgIGdseXBoRGF0YS5tZXRhZGF0YVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGdseXBoRGF0YS5tZXRhZGF0YTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjbG9uZURlZXAob3B0aW9ucyksXG4gICAgICAgICAge1xuICAgICAgICAgICAgZm9udE5hbWU6IG9wdGlvbnMuZm9udE5hbWUsXG4gICAgICAgICAgICBmb250UGF0aDogb3B0aW9ucy5jc3NGb250UGF0aFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgcmVzdWx0LnN0eWxlcyA9IG51bmp1Y2tzLnJlbmRlcihcbiAgICAgICAgICB0ZW1wbGF0ZUZpbGVQYXRoLFxuICAgICAgICAgIG51bmp1Y2tzT3B0aW9uc1xuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICBpZiAob3B0aW9ucy5mb3JtYXRzLmluZGV4T2YoJ3N2ZycpID09PSAtMSkge1xuICAgICAgICAgIGRlbGV0ZSByZXN1bHQuc3ZnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZm9ybWF0cy5pbmRleE9mKCd0dGYnKSA9PT0gLTEpIHtcbiAgICAgICAgICBkZWxldGUgcmVzdWx0LnR0ZjtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQuY29uZmlnID0gb3B0aW9ucztcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pXG4gICAgfSlcbiAgKVxufVxuIl19
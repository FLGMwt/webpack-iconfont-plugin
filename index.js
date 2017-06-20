import nodify from 'nodeify';
import fs from 'fs-extra';
import globParent from 'glob-parent';
import path from 'path';
import iconfont from './engine'

export default class IconfontPlugin {
  constructor(options = {}) {
    const required = ['svgs', 'fonts', 'styles'];

    required.forEach(function(r) {
      if (!options[r]) {
        throw new Error(`Require '${r}' option`);
      }
    })

    this.options = Object.assign({}, options);
    this.fileDependencies = [];

    this.compile = this.compile.bind(this);
    this.watch = this.watch.bind(this);
  }

  apply(compiler) {
    compiler.plugin('run', this.compile);
    compiler.plugin('watch-run', this.compile);
    compiler.plugin('after-emit', this.watch);
  }

  compile(compilation, callback) {
    const { options } = this;
    return nodify(
      iconfont(options).then(result => {
          const { fontName } = result.config;
          let destStyles = null;

          if (result.styles) {
              if (this.options.styles) {
                  destStyles = path.resolve(this.options.styles);
              }

              if (result.usedBuildInStylesTemplate) {
                  destStyles = path.join(
                      destStyles,
                      `${result.config.fontName}.${result.config.template}`
                  );
              } else {
                  destStyles = path.join(
                      destStyles,
                      path
                          .basename(result.config.template)
                          .replace('.njk', '')
                  );
              }
          }

          return Promise.all(
              Object.keys(result).map(type => {
                  if (
                      type === 'config' ||
                      type === 'usedBuildInStylesTemplate'
                  ) {
                      return Promise.resolve();
                  }

                  const content = result[type];
                  let destFilename = null;

                  if (type !== 'styles') {
                      destFilename = path.resolve(
                          path.join(this.options.fonts, `${fontName}.${type}`)
                      );
                  } else {
                      destFilename = path.resolve(destStyles);
                  }

                  return new Promise((resolve, reject) => {
                      fs.outputFile(destFilename, content, error => {
                          if (error) {
                              return reject(new Error(error));
                          }

                          return resolve();
                      });
                  });
              })
          );
      }),
      error => callback(error)
    );
  }

  watch(compilation, callback) {
    const globPatterns = typeof this.options.svgs === 'string' ? [this.options.svgs] : this.options.svgs;

    globPatterns.forEach(globPattern => {
      const context = globParent(globPattern);
      if (compilation.contextDependencies.indexOf(context) === -1) {
        compilation.contextDependencies.push(context);
      }
    });

    return callback();
  }
}

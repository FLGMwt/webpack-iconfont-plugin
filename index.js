import nodify from 'nodeify';
import fs from 'fs-extra';
import globParent from 'glob-parent';
import path from 'path';
import webfont from 'webfont';

export default class IconfontPlugin {
    constructor(options = {}) {
        if (!options.files) {
            throw new Error('Require `files` options');
        }

        if (!options.dest) {
            throw new Error('Require `dest` options');
        }

        this.options = Object.assign({
            template: './template.scss'
        }, options);
        console.log(this.options);
        this.fileDependencies = [];
    }

    apply(compiler) {
        compiler.plugin('run', (compilation, callback) =>
            this.compile(callback)
        );
        compiler.plugin('watch-run', (compilation, callback) =>
            this.compile(callback)
        );
        compiler.plugin('after-emit', (compilation, callback) =>
            this.watch(compilation, callback)
        );
    }

    compile(callback) {
        const { options } = this;

        return callback();
    }

    watch(compilation, callback) {
        const globPatterns = typeof this.options.files === 'string' ? [this.options.files] : this.options.files;

        globPatterns.forEach(globPattern => {
            const context = globParent(globPattern);
            if (compilation.contextDependencies.indexOf(context) === -1) {
                compilation.contextDependencies.push(context);
            }
        });

        return callback();
    }
}

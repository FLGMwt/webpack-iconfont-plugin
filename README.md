# webpack-iconfont-plugin

SVG to webfont conversion plugin for webpack.

## Features:

* Supported font formats: WOFF2, WOFF, EOT, TTF and SVG.
* Semantic: uses Unicode private use area.
* Cross-browser: IE8+.
* Generates SCSS file, custom templates possible.

## Usage:

`SCSS Styles:`

```scss
@import 'webfont.scss';

a.avatar {
    &::before {
        @extend %webfont;
        content: $webfont-avatar;
    }
}
```

`Webpack config:`

```js
import IconfontPlugin from 'webpack-iconfont-plugin';
import path from 'path';

export default {
    module: {
        loaders: [
            ...
        ]
    },
    plugins: [
        new IconfontPlugin({
            files: path.resolve(__dirname, '../assets/svg-icons/**/*.svg'),
            dest: {
                fonts: path.resolve(__dirname, '../assets/fonts'),
                scss: path.resolve(__dirname, '../styles/_iconfont.scss'),
            }
        })
    ],
    ...
};
```

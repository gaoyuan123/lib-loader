[![npm][npm]][npm-url]
[![node][node]][node-url]

<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>lib Loader</h1>
  <p>Instructs webpack to emit the required object as lib and to return its public URL</p>
</div>

<h2 align="center">Install</h2>

```bash
npm install --save-dev lib-loader
```

By default the libname of the resulting lib is the MD5 hash of the lib's contents with the original extension of the required resource.

```js
import myLibUrl from 'lib-loader?myLib!./lib.js'
```

**html**
```html
<script src="${myLibUrl}"></script>
<script>
  myLib.doSomeThing();
</script>
```

[npm]: https://img.shields.io/npm/v/file-loader.svg
[npm-url]: https://npmjs.com/package/lib-loader

[node]: https://img.shields.io/node/v/file-loader.svg
[node-url]: https://nodejs.org

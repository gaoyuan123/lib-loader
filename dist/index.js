
const loaderUtils = require('loader-utils');
const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin');
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
const LoaderTargetPlugin = require('webpack/lib/LoaderTargetPlugin');
const LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

const validateOptions = require('schema-utils');

const schema = require('./options.json');
module.exports = function libLoader() {};

module.exports.pitch = function pitch(request) {
    if (!this.emitFile)
        throw new Error('File Loader\n\nemitFile is required from module system');
    const query = loaderUtils.getOptions(this) || {};
    validateOptions(schema, query, 'lib Loader');
    
    const entryName = Object.keys(query)[0]
    const callback = this.async();
    const childCompiler = this._compilation.createChildCompiler(`lib-loader ${request}`, {});
    const childOptions = childCompiler.options;
    Object.assign(childOptions,{
        target: 'web',
    });
    Object.assign(childOptions.output ,{
        filename: '[name].js',
        library : '[name]',
    })

    childCompiler.context = this.context;
    childCompiler.apply(
      new NodeTemplatePlugin(),
      new NodeTargetPlugin(),
      new LibraryTemplatePlugin(entryName, 'var'),
      new SingleEntryPlugin(this.context, this.resourcePath,entryName),
      new LoaderTargetPlugin('web')
    );

    childCompiler.runAsChild((err, entries, compilation) => {
        if (err) return callback(err);
  
        if (compilation.errors.length > 0) {
          return callback(compilation.errors[0]);
        }
        compilation.fileDependencies.forEach((dep) => {
          this.addDependency(dep);
        }, this);
        compilation.contextDependencies.forEach((dep) => {
          this.addContextDependency(dep);
        }, this);

        const assets = compilation.assets;
        const files = Object.keys(assets);
        const outputPath = `__webpack_public_path__ + ${JSON.stringify(files[0])}`;
        
        callback(null, `module.exports = ${outputPath};`);
    });
}

module.exports.raw = true;
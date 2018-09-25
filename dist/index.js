
const loaderUtils = require('loader-utils');
const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin');
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
const LoaderTargetPlugin = require('webpack/lib/LoaderTargetPlugin');
const LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const path = require('path')

const validateOptions = require('schema-utils');

const schema = require('./options.json');

const buildFiles = {}

module.exports = function libLoader() {};

module.exports.pitch = function pitch(request) {
    if (!this.emitFile)
        throw new Error('File Loader\n\nemitFile is required from module system');
    const query = loaderUtils.getOptions(this) || {};
    validateOptions(schema, query, 'lib Loader');

    const callback = this.async();
    if(buildFiles[request]){
        const outputPath = `__webpack_public_path__ + '${buildFiles[request]}'`;
        return callback(null, `module.exports = ${outputPath};`);
    }
    
    const targetName = Object.keys(query)[0]
    const entryName = path.basename(this.resourcePath,'.js')
    const childCompiler = this._compilation.createChildCompiler(`lib-loader ${request}`, {});
    const childOptions = childCompiler.options;
    Object.assign(childOptions,{
        target: 'web',
    });
    Object.assign(childOptions.output ,{
        filename: '[name].[hash].js',
        library : '[name]',
    })

    childCompiler.context = this.context;
    childCompiler.apply(
      new NodeTemplatePlugin(),
      new NodeTargetPlugin(),
      new LibraryTemplatePlugin(targetName, 'var'),
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
        const outputPath = `__webpack_public_path__ + '${files[0]}'`;
        buildFiles[request] = files[0];
        callback(null, `module.exports = ${outputPath};`);
    });
}

module.exports.raw = true;
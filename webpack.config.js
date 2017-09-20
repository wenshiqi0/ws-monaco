const { join } = require('path');

module.exports = {
  entry: {
    editor: './src/editor/index.js',
  },
  output: {
    path: join(__dirname, './lib'),
    filename: '[name].js',
    libraryTarget: "umd",
    library: "tools"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ],
  },
  devtool: "cheap-source-map",
  externals(context, request, callback) {
    let isExternals = false;

    const vendor = ['vscode-textmate', 'vscode-extension-telemetry', 'vscode-languageserver', 'eslint', 'vscode', 'micromatch'];

    if (vendor.indexOf(request) > -1) {
      isExternals = request;
    }
    callback(null, isExternals);
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  target: 'electron',
  node: {
    __dirname: false
  }
}
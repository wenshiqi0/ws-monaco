const { join } = require('path');

module.exports = {
  entry: {
    index: './src/editor/index.js',
  },
  output: {
    path: join(__dirname, 'lib'),
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
      },
      {
        test: /\.spec.ts$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
    ],
  },
  externals(context, request, callback) {
    let isExternals = false;

    if (request === 'vscode-textmate' || request === 'electron' ) {
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
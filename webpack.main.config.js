const { join } = require('path');

module.exports = {
  entry: {
    main: './src/server/index.js',
    server: './src/server/index.js',
  },
  output: {
    path: join(__dirname, 'lib'),
    filename: '[name].js',
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
  resolve: {
    extensions: ['.js', '.json'],
  },
  externals(context, request, callback) {
    let isExternals = false;
    if (request === 'eslint' || request === 'electron' || request === 'vscode-textmate' || request === 'vscode-languageserver') {
      isExternals = `require('${request}')`;
    }
    callback(null, isExternals);
  },
  resolve: {
    extensions: ['.js', '.json', '.d.ts', '.ts',],
  },
  target: 'electron',
  node: {
    __dirname: false
  }
}
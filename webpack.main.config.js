const { join } = require('path');

module.exports = {
  entry: {
    main: './src/main.ts',
  },
  output: {
    path: join(__dirname, 'lib'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.d.ts$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  externals(context, request, callback) {
    let isExternals = false;
    if (request === 'eslint' || request === 'electron') {
      isExternals = `require('${request}')`;
    }
    callback(null, isExternals);
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  target: 'electron',
  node: {
    __dirname: false
  }
}
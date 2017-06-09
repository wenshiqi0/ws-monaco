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
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  target: 'electron',
  node: {
    __dirname: false
  }
}
const { join } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.ts',
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
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  externals(context, request, callback) {
    let isExternals = false;

    if (request === 'vscode-textmate' || request === 'eslint') {
      isExternals = request;
    }

    callback(null, isExternals);
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'plugins/syntaxes/css/syntaxes/css.tmLanguage.json',
        to: 'syntaxes/css.tmLanguage.json',
      },
      {
        from: 'plugins/syntaxes/javascript/syntaxes/JavaScript.tmLanguage.json',
        to: 'syntaxes/javascript.tmLanguage.json',
      },
      {
        from: 'plugins/syntaxes/html/syntaxes/html.json',
        to: 'syntaxes/html.tmLanguage.json',
      },
      {
        from: 'plugins/syntaxes/json/syntaxes/JSON.tmLanguage',
        to: 'syntaxes/JSON.tmLanguage',
      },
      {
        from: 'node_modules/typescript/lib/lib.es6.d.ts',
        to: 'lib.es6.d.ts',
      }
    ]),
  ],
  target: 'node',
  node: {
    __dirname: false
  }
}
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
    if (request === 'vscode-textmate' || request === 'electron' ) {
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
        from: 'plugins/syntaxes/css/syntaxes/less.tmLanguage.json',
        to: 'syntaxes/less.tmLanguage.json',
      },
      {
        from: 'plugins/syntaxes/javascript/syntaxes/JavaScript.tmLanguage.json',
        to: 'syntaxes/javascript.tmLanguage.json',
      },
      {
        from: 'plugins/syntaxes/axml/syntaxes/axml.json',
        to: 'syntaxes/axml.tmLanguage.json',
      },
      {
        from: 'plugins/syntaxes/json/syntaxes/JSON.tmLanguage',
        to: 'syntaxes/JSON.tmLanguage',
      },
      {
        from: 'plugins/syntaxes/nunjucks/syntaxes/nunjucks.tmLanguage',
        to: 'syntaxes/nunjucks.tmLanguage',
      },
      {
        from: 'plugins/syntaxes/fengdie/syntaxes/schema.tmLanguage.json',
        to: 'syntaxes/schema.tmLanguage.json',
      },
    ]),
  ],
  target: 'electron',
  node: {
    __dirname: false
  }
}
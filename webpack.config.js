const path = require('path');

const HTMLWebpackPlugin = require('html-webpack-plugin');

const mode =
  process.env.NODE_ENV === 'development' ? 'development' : 'production';

module.exports = {
  mode,
  output: {
    path: path.resolve(__dirname, './dist'),
  },
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    port: 8080,
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html',
    }),
  ],
};

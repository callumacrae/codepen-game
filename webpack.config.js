const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const mode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  mode,
  entry: path.resolve(__dirname, './src/index.ts'),
  resolve: {
    extensions: ['.js', '.json', '.ts'],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
  },
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    port: 8080,
  },
  devtool: mode === 'development' ? 'eval-cheap-source-map' : 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: { allowTsInNodeModules: true },
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'public/assets', to: 'assets' }],
    }),
    // new require('webpack-bundle-analyzer').BundleAnalyzerPlugin,
  ],
};

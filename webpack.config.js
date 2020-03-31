const path = require('path');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const buildPath = './build/';
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: ['./src/App.js'],
  output: {
    path: path.join(__dirname, buildPath),
    filename: '[name].[hash].js'
  },
  target: 'web',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: path.resolve(__dirname, './node_modules/'),
      },{
        test: /\.(jpe?g|png|gif|svg|tga|gltf|babylon|mtl|pcb|pcd|prwm|obj|mat|mp3|ogg)$/i,
        use: 'file-loader',
        exclude: path.resolve(__dirname, './node_modules/')
      },{
        test: /\.(vert|frag|glsl|shader|txt)$/i,
        use: 'raw-loader',
        exclude: path.resolve(__dirname, './node_modules/')
      },{
        type: 'javascript/auto',
        test: /\.(json)/,
        exclude: path.resolve(__dirname, './node_modules/'),
        use: [{
          loader: 'file-loader'
        }],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'COVID-19 Pandemic',
      template: 'index.html',
      favicon: 'favicon.png',
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      title: 'COVID-19 Pandemic',
      template: 'mobile.html',
      favicon: 'favicon.png',
      filename: 'mobile.html'
    }),
    new CopyPlugin([
      { from: 'data', to: 'data' },
      { from: 'css', to: 'css' }
    ])
  ]
}

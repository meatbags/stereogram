var path = require('path');
var webpack = require('webpack');
var MiniCssExtract = require("mini-css-extract-plugin");
var UglifyJs = require("uglifyjs-webpack-plugin");
var TerserJs = require("terser-webpack-plugin");
var OptimizeCSSAssets = require("optimize-css-assets-webpack-plugin");

// path
var appName = 'STEREOGRAM';
var pathJS = './js/app.js';
var pathSCSS = './scss/style.js';
var pathJSOutput = 'build';
var pathCSSOutput = 'build';

module.exports = [{
    entry: {'app.min': pathJS},
    output: {
      library: appName,
      libraryTarget: 'var',
      path: path.resolve(__dirname, pathJSOutput),
      filename: '[name].js'
    },
    module: {
      rules: [{
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {targets: { chrome: 53, ie: 11 }}
              ]
            ]
          }
        }
      }]
    },
    optimization: {
      minimizer: [
        new TerserJs({
          test: /\.js(\?.*)?$/i,
          terserOptions: {
            mangle: true,
          },
        }),
      ],
    },
    stats: {colors: true, warnings: false}
  },{
    entry: {'style.webpack': pathSCSS},
    output: {
      path: path.resolve(__dirname, pathCSSOutput),
      filename: '[name].js'
    },
    module: {
      rules: [{
        test: /\.scss$/,
        use: [
          MiniCssExtract.loader, {
            loader: 'css-loader',
            options: {importLoaders: 2, sourceMap: true}
          }, {
            loader: 'sass-loader',
            options: {sourceMap: true}
          }
        ]
      }]
    },
    optimization: {
      minimizer: [
        new UglifyJs({
          cache: true,
          parallel: true,
          sourceMap: true
        }),
        new OptimizeCSSAssets({})
      ]
    },
    plugins: [new MiniCssExtract({filename: './style.min.css', allChunks: true})]
  }
];

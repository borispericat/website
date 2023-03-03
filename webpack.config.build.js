const path = require('path')

const config = require('./webpack.config')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { merge } = require('webpack-merge')

module.exports = merge(config, {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'public')
  },

  plugins: [
    new CleanWebpackPlugin()
  ]

})

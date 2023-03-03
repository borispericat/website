const path = require('path')
const webpack = require('webpack')

const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const miniCssExtractPlugin = require('mini-css-extract-plugin')
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")




const IS_DEVELOPMENT = process.env.NODE_ENV == 'dev'
const dirApp = path.join(__dirname, 'app')
const dirShared = path.join(__dirname, 'shared')
const dirStyles = path.join(__dirname, 'styles')
const dirNode = 'node_modules'

module.exports = {
    entry: [
        path.join(dirApp, 'index.js'),
        path.join(dirStyles, 'index.scss'),
    ],

  resolve: {
        modules:[
            dirApp,
            dirStyles,
            dirShared,
            dirNode
        ]

    },

    plugins: [
        new webpack.DefinePlugin({
            IS_DEVELOPMENT
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './shared',
                    to: ''
                }
            ]
        }),

        new miniCssExtractPlugin({
            filename:'[name].css',
            chunkFilename: '[id].css'
        }),

        new ImageMinimizerPlugin({
            minimizer: {
              implementation: ImageMinimizerPlugin.imageminMinify,
              options: {
                // Lossless optimization with custom option
                // Feel free to experiment with options for better result for you
                plugins: [
                  ["gifsicle", { interlaced: true }],
                  ["jpegtran", { progressive: true }],
                  ["optipng", { optimizationLevel: 5 }],
                ],
              },
            },
          }),
          
        new CleanWebpackPlugin()
    
    ],

    module: {
        rules:[
            {
                test: /\.js$/,
                use:{
                    loader:'babel-loader'
                }
            },

            {
                test: /\.scss$/,
                use: [
                    {
                        loader: miniCssExtractPlugin.loader,
                        options: {
                            publicPath: ''
                        }
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader'
                    },
                     {
                        loader: 'sass-loader'
                     }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff2|fnt|webp)$/i,
                loader: 'file-loader',
                options:{
                    
                    name(file){
                        return '[hash].[ext]'
                    }
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg|webp)$/i,
                use: [{
                    loader: ImageMinimizerPlugin.loader,
                }]
            },
            {
                test: /\.(glsl|frag|vert)/i,
                loader: 'raw-loader',
                exclude: /node-modules/
            },
            {
                test: /\.(glsl|frag|vert)/i,
                loader: 'gslify-loader',
                exclude: /node_modules/
            }
        ]
        
    },
    
     optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
      },
}

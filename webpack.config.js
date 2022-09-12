var webpack = require("webpack");
const path = require("path");
const fs = require('fs');

// include the js minification plugin
const TerserPlugin = require('terser-webpack-plugin');

// include the css extraction and minification plugins
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

// include the HTML templating plugin
const HTMLWebpackPlugin = require("html-webpack-plugin");
const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir))
    return templateFiles.map(item => {
        // Split names and extension
        const parts = item.split('.')
        const name = parts[0]
        const extension = parts[1]
        return new HTMLWebpackPlugin({
            filename: `${name}.html`,
            template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`)
        })
    })
}

// We will call the function like this:
const htmlPlugins = generateHtmlPlugins('./src/pages')

module.exports = env => {
    
    return {
        entry: ["./src/js/script.js", "./src/scss/styles.scss"],
        output: {
            filename: "js/index.[hash:8].js",
            path: path.join(__dirname, "./build/")
        },
        devServer: {
            contentBase: "./build",
            disableHostCheck: true
        },
        module: {
            rules: [
                // perform js babelization on all .js files
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                },
                {
                    test: /.(ttf|otf|eot|woff2?)/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }]
                },
                {
                    test: /\.(svg|png|jpe?g)/,
                    use: [{
                            loader: "file-loader",
                            options: {
                                name: "[name].[ext]",
                                outputPath: 'img/',
                                limit: 5000
                            }
                        },
                        {
                            loader: "img-loader"
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                                sourceMap: true
                            }
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
                new webpack.EnvironmentPlugin({
                    NODE_ENV: env
                }),
                new CleanWebpackPlugin(),
                new MiniCssExtractPlugin({
                    filename: "css/main.[contenthash:8].css"
                }),
                new CopyWebpackPlugin([{
                    from: 'src/images',
                    to: 'images'
                }]),
                new CopyWebpackPlugin([{
                    from: 'src/fonts',
                    to: 'fonts'
                }])
            ]
            .concat(htmlPlugins)
            .concat(new HtmlBeautifyPlugin({
                config: {
                    html: {
                        end_with_newline: true,
                        indent_size: 2,
                        indent_with_tabs: true,
                        indent_inner_html: true,
                        preserve_newlines: true,
                        unformatted: ['p', 'i', 'b', 'span']
                    }
                }
            })),
        optimization: {
            minimize: false,
            minimizer: [
                // enable the js minification plugin
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true,
                    terserOptions: {
                        output: {
                            comments: false,
                        },
                    },
                }),
                // enable the css minification plugin
                new OptimizeCSSAssetsPlugin({})
            ]
        }
    }
};
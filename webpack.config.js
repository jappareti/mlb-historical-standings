const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpackMerge = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// const modeConfig = env => require(`./build-utils/webpack.${env}`)(env);
// const presetConfig = require("./build-utils/loadPresets");

module.exports = ({ mode, presets } = { mode: "production", presets: [] }) => {
  return webpackMerge(
    {
      mode,
      module: {
        rules: [
          // {
          //   test: /\.jpe?g$/,
          //   use: [
          //     {
          //       loader: "url-loader",
          //       options: {
          //         limit: 5000
          //       }
          //     }
          //   ]
          // }
        ]
      },
      output: {
        filename: "bundle.js"
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: "./src/index.html",
          filename: "index.html",
          inject: "body"
        }),
        new CopyWebpackPlugin([{ from: "data" }])
        // new webpack.ProgressPlugin()
      ]
    }
    // modeConfig(mode),
    // presetConfig({ mode, presets })
  );
};
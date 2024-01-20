const path = require("path");
const GasPlugin = require("gas-webpack-plugin");

module.exports = {
  entry: './src/index.ts',
  mode: "production", // development or production
  devtool: false,
  bail: false,
  output: {
    path: path.join(__dirname, "../", "dist"),
    filename: 'gas.js',
    environment: {
      arrowFunction: false,
    },
  },
  resolve: {
    modules: [
      path.resolve('./src'),
      "node_modules",
    ],
    extensions: [".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      }
    ],
  },
  plugins: [
    new GasPlugin(),
  ],
};
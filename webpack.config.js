const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/MOTCCRUDTable.js",
  output: {
    path: path.resolve("lib"),
    filename: "MOTCCRUDTable.js",
    libraryTarget: "commonjs2",
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        use: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|gif|woff|woff2|eot|ttf|svg)$/,
        loader: "url-loader?limit=100000",
      },
    ],
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      lodash: path.resolve(__dirname, "./node_modules/lodash"),
      "prop-types": path.resolve(__dirname, "./node_modules/prop-types"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      primereact: path.resolve(__dirname, "./node_modules/primereact"),
      primeicons: path.resolve(__dirname, "./node_modules/primeicons"),
      primeflex: path.resolve(__dirname, "./node_modules/primeflex"),
    },
  },
  externals: {
    // Don't bundle react or react-dom
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "React",
      root: "React",
    },
    "react-dom": {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "ReactDOM",
      root: "ReactDOM",
    },
  },
};

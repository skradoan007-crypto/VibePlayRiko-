module.exports = function (api) {
  api.cache(true)
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
          },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        },
      ],
      // SDK 54 / Reanimated 4: the Reanimated + Worklets Babel plugin is now
      // configured AUTOMATICALLY by babel-preset-expo (it detects the installed
      // react-native-worklets package). Do NOT add "react-native-reanimated/plugin"
      // or "react-native-worklets/plugin" here as well — it is deprecated to do so
      // and would apply the transform twice.
    ],
  }
}

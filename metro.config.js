// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// Allow importing common audio/asset file types as static assets.
config.resolver.assetExts.push("mp3", "m4a", "flac", "wav", "ogg", "lrc", "db")

module.exports = config

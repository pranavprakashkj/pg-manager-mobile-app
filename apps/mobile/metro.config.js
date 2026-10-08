const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Metro watches the whole workspace (auto-configured monorepo). /spikes holds disposable experiments with their own
// node_modules; keep them out of the app bundle graph.
const existingBlockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existingBlockList) ? existingBlockList : existingBlockList ? [existingBlockList] : []),
  /[/\\]spikes[/\\].*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });

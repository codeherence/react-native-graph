// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Modify the resolver to include the path to your library
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => {
      // Redirects dependencies by name
      if (name === "@codeherence/react-native-graph") {
        return path.join(__dirname, "..", "src");
      }
      return path.join(process.cwd(), "node_modules", name);
    },
  }
);

// npm v7+ will install ../node_modules/react-native because of peerDependencies.
// To prevent the incompatible react-native bewtween ./node_modules/react-native and ../node_modules/react-native,
// excludes the one from the parent folder when bundling.
config.resolver.blockList = [
  ...Array.from(config.resolver.blockList ?? []),
  new RegExp(path.resolve("..", "node_modules", "react-native")),
];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../node_modules"),
];

config.resolver.assetExts.push("mjs");
config.resolver.assetExts.push("cjs");

config.watchFolders = [path.resolve(__dirname, "..")];

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;

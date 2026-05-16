const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "../..");
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.assetExts = [...config.resolver.assetExts, "glb", "gltf", "webp"];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.blockList = [
  /apps\/strapi\/dist\/.*/,
  /apps\/strapi\/node_modules\/.strapi\/.*/,
  /apps\/strapi\/\.strapi\/.*/,
  /apps\/strapi\/tmp\/.*/,
];

config.resolver.extraNodeModules = {
  three: path.resolve(workspaceRoot, "node_modules/three"),
};

const defaultResolver = config.resolver.resolverMainFields;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("three/examples/jsm/")) {
    const suffix = moduleName.slice("three/".length);
    const candidates = [
      path.resolve(workspaceRoot, "node_modules/three", suffix + ".js"),
      path.resolve(workspaceRoot, "node_modules/three", suffix + "/index.js"),
    ];
    for (const candidate of candidates) {
      try {
        require("fs").accessSync(candidate);
        return { type: "sourceFile", filePath: candidate };
      } catch {}
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

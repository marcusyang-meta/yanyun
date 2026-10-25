// Expo monorepo 配置 (官方 monorepos 指南): 项目在 workspace 子目录时,
// Metro 需显式 watch 仓根并按 [项目 node_modules, 仓根 node_modules]
// 顺序解析, 才能跟上 workspaces 的符号链接包 (@yanyun/*) 与 hoist 依赖。
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;

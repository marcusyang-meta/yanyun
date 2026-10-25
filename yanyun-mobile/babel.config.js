module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Relay: 编译 graphql`` 模板为生成的 artifact 引用（与网站同口径）
    plugins: ['relay'],
  };
};

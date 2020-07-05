const { override, addWebpackAlias } = require('customize-cra');

module.exports = override(
  addWebpackAlias({
    'react': 'preact/compat',
    'react-dom': 'preact/compat'
  })
);
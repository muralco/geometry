const webpackTsLibrary = require('@muralco/config/webpack/webpack-ts-library.config');

/** @type {() => import('webpack').Configuration} */
module.exports = (env, argv) => ({
  ...webpackTsLibrary(env, argv),
});

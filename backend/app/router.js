'use strict';

const basepath = '/api';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get(basepath + '/', controller.home.index);
  router.get(basepath + '/ys/geturls', controller.ys.getUrls);
  router.get(basepath + '/ping', controller.ga.index);
};

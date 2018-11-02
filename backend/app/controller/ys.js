'use strict';

const Controller = require('egg').Controller;

class YsController extends Controller {
  async getUrls() {
    this.ctx.body = 'hi, egg';
  }
}

module.exports = YsController;

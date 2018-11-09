'use strict';

const Controller = require('egg').Controller;

class YsController extends Controller {
  async getUrls() {
    const result = await this.ctx.curl('https://open.ys7.com/view/h5/077e9a83d7c441f08bae826cd3455e99');
    const resulrArray = result.data.toString().split('\n');
    let urlStr = '';
    for (let i = 0; i < resulrArray.length; i++) {
      if (resulrArray[i].indexOf('playUrl') > 0) {
        urlStr = resulrArray[i];
        break;
      }
    }
    this.ctx.body = urlStr;
  }
}

module.exports = YsController;

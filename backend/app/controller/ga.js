'use strict';

const Controller = require('egg').Controller;
const uuid = require('uuid');
const _ = require('lodash');

const api = 'http://www.google-analytics.com/collect';
const keys = [
  'v', 'tid', 'ds', 'qt', 'z', 'cid', 'uid', 'sc',
  'uip', 'ua', 'dr', 'sr', 'vp', 'ul', 't', 'dl',
  'dt', 'ec', 'ea', 'el', 'ev', 'sn', 'sa', 'st',
  'utc', 'utv', 'utt', 'utl', 'plt', 'dns', 'pdt',
  'rrt', 'tcp', 'srt', 'dit', 'clt', 'exd', 'exf',
  'cd1', 'cm1', 'cd2', 'cm2',
];

class GaController extends Controller {
  async index() {
    const ctx = this.ctx;
    const data = {
      dr: ctx.params.r,
      dt: ctx.params.t,
      sr: ctx.params.s,
      vp: ctx.params.v,
      cd1: 'dpr' + ctx.params.dpr,
    };
    sendGoogle(ctx, baseData(ctx, data));
  }
}

function baseData(ctx, data) {
  let tid = 'UA-90845625-1';
  tid = { tid };
  const base = {
    cid: clientId(ctx),
    t: 'pageview',
    uip: ctx.request.ip,
    ua: ctx.get('user-agent') || '',
    ul: ctx.locale,
    dl: ctx.get('referrer'),
  };

  return Object.assign(Object.assign(base, tid), data);
}

function clientId(ctx) {
  let cid = ctx.cookies.get('cid');
  if (!cid) {
    cid = uuid.v4();
    ctx.cookies.set('cid', cid, { maxAge: 3600 * 24 * 365 });
  }

  return cid;
}

async function sendGoogle(ctx, options) {
  const temp = Date.now().toString().substr(-8) + parseInt(Math.random() * 10000, 10);
  const defaultOption = {
    v: 1,
    ds: 'web',
    z: temp,
  };
  options = Object.assign(defaultOption, options);
  const form = {};
  keys.forEach(key => {
    const value = options[key];
    if (_.isString(value) || _.isNumber(value)) {
      form[key] = value;
    }
  });
  ctx.logger.info(JSON.stringify(form));
  const result = await ctx.curl(api, {
    method: 'POST',
    data: form,
    dataType: 'json',
  });

  return result;
}

module.exports = GaController;

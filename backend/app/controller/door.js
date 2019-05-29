'use strict';

const Controller = require('egg').Controller;
const axios = require('axios');
const qs = require('qs');
const phone = '18611641049';
const pw = '8ebf5eff9c4bcb68';

class DoorController extends Controller {
  async index() {
    // this.ctx.body = 'hi, egg';
    console.log('in')
    const res = await login();
    const token = res.Data.Token;
    const homeId = res.Data.House.ID;

    const equip = (await searchEquipment(token)).Data;

    let result = await open(token, '92018052830079', homeId);
    this.ctx.body = JSON.stringify(result.data)
  }

}

async function login() {
  const result = await axios.post(`http://tcc.einwin.com:8000//MobileApi/House/Login?account=${phone}&password=${pw}`
  );

  return result.data;
}

async function searchEquipment(token) {
  const result = await axios.get(`http://tcc.einwin.com:8001/Api/MobileApi/Index/SearchEquipment?token=${token}`);

  return result.data;
}

async function open(token, eqId, houseId) {
  const message = {
    msg: 'tc_20150330_unlock' + (new Date()).getTime(),
    formuid: houseId,
    messageSenderType: 1,
  };

  const data = {
    token,
    channel: eqId,
    message: JSON.stringify(message),
  };
  let res = await axios.request({
    url: 'http://tcc.einwin.com:8000//MobileApi/Publisher/Publish',
    method: 'POST',
    data: qs.stringify(data),
    contentType: 'application/x-www-form-urlencoded',
  });

  return res;
}

module.exports = DoorController;

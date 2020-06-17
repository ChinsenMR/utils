'use strict';

const Controller = require('egg').Controller;

class GoodsController extends Controller {
  async goodsList() {
    const {
      ctx
    } = this;

    console.log(ctx, '??')

    const {

      header: {
        cookie
      }
    } = ctx;


    const result = [{
      name: '康师傅冰红茶',
      price: '3.5',
      goodsImage: 'https://img.alicdn.com/imgextra/i2/379930139/O1CN013n0UoV1CtheknG5r0_!!0-saturn_solar.jpg_220x220.jpg_.webp',
      sku: [
        [{
          id: 155,
          type: 1,
          text: '1L'
        }, {
          id: 156,
          type: 2,
          text: '350ML'
        }, {
          id: 157,
          type: 2,
          text: '2L'
        }],
        [{
          id: 155,
          type: 1,
          text: '510ML'
        }, {
          id: 156,
          type: 2,
          text: '630ML'
        }]
      ],
      desc: '每一片茶叶都是精挑细选',
      count: 11,
      id: 87,
    }]

    ctx.body = {
      data: result,
      errMsg: '用户未登录',
      errCode: cookie ? 1 : 2,
    };
  }
}

module.exports = GoodsController;
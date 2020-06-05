import config from "../config.js";
import alert from "./alert";
/**
 * Author: Chinsen
 * Date: 2020.05.22
 */

export default {
  /**
   * 主请求体
   * @param {*} options
   */
  async request(options) {
    let that = this;

    /* request只拿数据 直接返回不做任何数据处理 */
    const $async = () => {
      const {
        method = "GET",
          data = {},
          url = "NO_URL",
          hideLoading = false,
      } = options;

      const header = that.setHeader(method);

      const timeout = 10 * 1000;

      data.sessionId = wx.getStorageSync("sessionId");

      const params = {
        method,
        data,
        header,
        timeout,
        url: config.url + url,
      };

      if (!hideLoading) alert.loading();

      return new Promise((resolve, reject) => {
        wx.request({
          ...params,
          success(res) {
            resolve(res.data);
          },
          fail(err) {
            const {
              errMsg
            } = err;
            const isTimeout = errMsg.indexOf("isTimeout") != -1;

            alert.message(isTimeout ? "请求超时，请检查网络状况" : errMsg);

            reject(err);
          },
          complete(spin) {
            alert.closeLoading();

            that.throwMessage(params, spin);
          },
        });
      });
    };

    /* 拿到请求结果 */
    const response = await $async();

    /* 返回结果 */
    return that.handleAbnormal(response);
  },

  /**
   * 单独处理header
   * @returns header参数
   */
  setHeader(method = "GET") {
    const Cookie = wx.getStorageSync("cookie");
    const contentType = {
      POST: "application/x-www-form-urlencoded",
      GET: "application/json",
    };

    return {
      Cookie,
      "content-type": contentType[method],
    };
  },

  /**
   *处理异常状态
   *该接口的宗旨是，处理掉所有异常状态，阻止方法继续执行下去
   */
  handleAbnormal(result) {
    /* 针对新旧版本接口返回值异常处理 */
    const abnormal = [
      /* 接口无返回值 */
      {
        type: "NO_VALUE",
        bool: Boolean(!result),
        handle: () => {
          alert.error("返回值错误");
        },
      },

      /* 处理未登录 */
      {
        type: "NO_LOGIN",
        bool: Boolean(
          result.errCode == 2 || ["Login", "login"].includes(result.Status) || result.Code == -99
        ),
        handle: () => {
          wx.navigateTo({
            url: "/pages/authorizationLogin/authorizationLogin",
          });
        },
      },

      /* 处理错误结果 */
      {
        type: "WARNNING",
        bool: Boolean(result.Error || result.Message || result.Code == -1),
        handle: () => {
          alert.error(result.Error || result.Message || result.Msg);
        },
      },
    ];

    /* 循环处理异常 */
    abnormal.map((type) => {
      if (type.bool) {
        return type.handle()
      };
    });

    /* 无异常，返回数据 */
    return result;
  },

  /**
   * 提供请求参数打印，以便快速定位错误
   */
  throwMessage(params, response) {
    const targetPage = getCurrentPages();
    const route = targetPage[targetPage.length - 1].route;

    console.log("<debugger>");

    console.info(
      ` 请求页面：${route}\n 请求地址：${params.url}\n 请求方式：${params.method} \n`,
      `请求头部：`,
      params.header,
      `\n`,
      `请求参数：`,
      params.data,
      `\n`,
      `返回状态：`,
      response.statusCode,
      `\n`,
      `返回数据：`,
      response.data
    );

    console.log("</debugger>");
  },
};
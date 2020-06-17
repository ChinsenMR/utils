import config from "../config.js";
import alert from "./alert";
/**
 * Author: Chinsen
 * Date: 2020.05.22
 */

export default {
  /* 是否需要拦截下一个请求 避免多次跳转到授权页面*/
  IS_NEED_INTERCEP: false,

  /* 请求超时限制 */
  TIME_OUT: 10 * 1000,

  /**
   * 主请求体
   * @param {*} options
   */
  async request(options) {
    /* request只拿数据 直接返回不做任何数据处理 */
    const $ajax = () => {
      const {
        method = "GET",
          data = {},
          url = "NO_URL",
          hideLoading = false,
      } = options;

      const header = this.setHeader(method);

      const timeout = this.TIME_OUT;

      data.sessionId = wx.getStorageSync("sessionId");

      const params = {
        method,
        data,
        header,
        timeout,
        url: config.api.domain + url,
      };

      if (!hideLoading) alert.loading();

      return new Promise((resolve, reject) => {
        wx.request({
          ...params,
          success: (res) => {
            resolve(res.data);
          },
          fail: (err) => {
            const {
              errMsg
            } = err;

            const isTimeOut = errMsg.indexOf("timeout") != -1;

            alert.message(isTimeOut ? "请求超时，请检查网络状况" : errMsg);

            reject(err);
          },
          complete: (spin) => {
            alert.closeLoading();

            /* 执行debugger，可在控制台查看请求前后状态 */
            this.throwDebugger(params, spin);
          },
        });
      });
    };

    /* 拿到请求结果 */
    const response = await $ajax();

    /* 返回结果 */
    return this.handleAbnormal(response);
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
   */
  handleAbnormal(result) {

    /* 错误提示 */
    const ERROR_MESSAGE = result.Error || result.Message || result.msg || result.Msg || result.errMsg || '服务器错误';

    /* 针对新旧版本接口返回值异常处理 */
    const abnormal = [
      /* 接口无返回值 */
      {
        type: "NO_VALUE",
        bool: Boolean(!result),
        handle: () => {
          return alert.message("返回值错误，请检查");
        },
      },

      /* 处理未登录 */
      {
        type: "NO_LOGIN",
        bool: Boolean(
          result.errCode == 2 || ["Login", "login"].includes(result.Status)
        ),
        handle: () => {
          /* 如果未登录，并且拦截未开启，那么前往登录 */
          if (!this.IS_NEED_INTERCEP)
            return wx.navigateTo({
              url: "/pages/authorization/authorization",
              success: () => {
                /* 已经跳转去登录了，无需重复跳转 开启拦截，阻止重复跳转到授权页面 */
                this.IS_NEED_INTERCEP = true;
              },
            });
        },
      },

      /* 处理普通错误结果 */
      {
        type: "WARNNING",
        bool: Boolean(ERROR_MESSAGE && result.errCode !== 1),
        handle: () => {
          return alert.error(ERROR_MESSAGE);
        },
      },
    ];

    /* 循环处理异常 */
    abnormal.map((type) => {
      if (type.bool) return type.handle();
    });

    /* 正常返回数据，拦截关闭 */
    this.IS_NEED_INTERCEP = false;

    /* 无异常，返回数据 */
    return result;
  },

  /**
   * 提供请求参数打印，以便快速定位错误
   */
  throwDebugger(params, response) {
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
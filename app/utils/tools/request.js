/**
 * Author: Chinsen
 * Date: 2020.05.22
 */
import config from "../config.js";

export default {
  /* 是否需要拦截下一个请求 避免多次跳转到授权页面*/
  IS_NEED_INTERCEP: false,

  /* 请求超时限制 */
  TIME_OUT: 10 * 1000,

  /* 上一页面路由 */
  PREV_ROUTE: null,

  /* 历史页面 */
  HISTORY_PAGES: [],
  /**
   * 主请求体
   * @param {data, url, method, hideLoading, header, hideToast} options
   */
  async request(options) {
    const app = getApp();

    /* 查看请求权限，如果没有权限那么停止执行 */
    const IS_HAVE_RIGHT = this.accessAuth();

    /* 无权限直接拦截*/
    if (!IS_HAVE_RIGHT) return

    /* request只拿数据 直接返回不做任何数据处理 */
    const $ajax = () => {
      const {
        data = {},
          url = "NO_URL",
          method = "GET",
          hideLoading = false,
          header = this.setHeader(method)
      } = options;

      /* 请求头部，如果默认根据请求类型设置相应头部 */
      const defaultHeader = header || this.setHeader(method);

      const timeout = this.TIME_OUT;

      data.sessionId = wx.getStorageSync("sessionId");

      const ajaxParams = {
        method,
        data,
        header: defaultHeader,
        timeout,
        url: config.api.domain + url,
      };

      if (!hideLoading) app.alert.loading();

      return new Promise((resolve, reject) => {
        wx.request({
          ...ajaxParams,
          success: (res) => {
            resolve(res.data);
          },
          fail: (err) => {
            const {
              errMsg
            } = err;

            const isTimeOut = errMsg.indexOf("timeout") != -1;

            app.alert.message(isTimeOut ? "请求超时，请检查网络状况" : errMsg);

            reject(err);
          },
          complete: (spin) => {
            app.alert.closeLoading();

            /* 执行debugger，可在控制台查看请求前后状态 */
            this.throwDebugger(params, spin);
          },
        });
      });
    };

    /* 拿到请求结果 */
    const response = await $ajax();

    /* 返回结果 */
    return this.handleAbnormal(response, options);
  },

  /**
   * 单独处理header
   * @returns header参数
   */
  setHeader(method = "GET") {
    const Cookie = wx.getStorageSync("_cookie_");
    const contentType = {
      POST: "application/x-www-form-urlencoded",
      GET: "application/json",
    };

    return {
      Cookie,
      "content-type": contentType[method],
    };
  },

  /* 验证是否有继续执行下一个方法的权限 */
  accessAuth() {
    const pages = getCurrentPages();
    const currentPageRoute = pages[pages.length - 1].route;

    let isHaveRequestAuth = true; /* 请求接口的权限 */

    /* 如果当前路由不等于上一页面路由 */
    if (this.PREV_ROUTE !== currentPageRoute) {
      /* 重新开启跳转拦截 */
      this.IS_NEED_INTERCEP = false;

      /* 如果拦截条件为true那么必然未登录，故没有权限 */
      if (this.IS_NEED_INTERCEP) {
        isHaveRequestAuth = false
      }

      /*对应小程序5条page的限制 */
      if (this.HISTORY_PAGES.length === 5) {
        this.HISTORY_PAGES.splice(0, 1);
      } else {
        /* 如果历史page里面没有当前路由，那么将当前路由push进历史page */
        if (!this.HISTORY_PAGES.includes(currentPageRoute)) {
          this.HISTORY_PAGES.push(currentPageRoute);
        }
      }

      /* 逻辑处理完上一页面路由赋值为当前页面 */
      this.PREV_ROUTE = currentPageRoute;
    } else {
      /* 如果历史page中有当前路由，那么确定为返回页，给予请求权限 */
      if (this.HISTORY_PAGES.includes(currentPageRoute)) {
        isHaveRequestAuth = true
      }
      /* 路由相同，仍在当前页面，已请求过一个接口返回未登录，无权限 */
      isHaveRequestAuth = false
    }

    return isHaveRequestAuth
  },

  /**
   *  处理异常，并返回结果
   * @param {请求结果} response 
   * @param {请求参数} options 
   */
  handleAbnormal(response, options) {
    const app = getApp();
    const {
      Error,
      Message,
      msg,
      Msg,
      errMsg,
      errCode,
      Status
    } = response;
    const {
      hideToast
    } = options;

    /* 错误提示 */
    const ERROR_MESSAGE = Error || Message || msg || Msg || errMsg || '服务器错误';

    /* 针对新旧版本接口返回值异常处理 */
    const abnormal = [
      /* 接口无返回值 */
      {
        type: "NO_RESPONSE",
        bool: response === undefined || response === null,
        handle: () => app.alert.message("返回值错误，请检查")
      },

      /* 处理未登录 */
      {
        type: "NO_LOGIN",
        bool: errCode == 2 || ["Login", "login"].includes(Status),
        handle: () => {
          /* 未开启跳转拦截，未登录，那么允许前往登录 */
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
        bool: !hideToast && (ERROR_MESSAGE && errCode !== 1),
        handle: () => app.alert.error(ERROR_MESSAGE)
      }
    ];

    /* 循环处理异常 */
    abnormal.forEach((type) => {
      if (type.bool) return type.handle();
    });

    /* 正常返回数据，拦截关闭 */
    this.IS_NEED_INTERCEP = false;

    /* 无异常，返回数据 */
    return response;
  },

  /**
   * 提供请求参数打印，以便快速定位错误
   * @param {请求阐述} params 
   * @param {请求结果} response 
   */
  throwDebugger(options, response) {
    const targetPage = getCurrentPages();
    const route = targetPage[targetPage.length - 1].route;

    console.log("<debugger>");

    console.info(
      ` 请求页面：${route}\n 请求地址：${options.url}\n 请求方式：${options.method} \n`,
      `请求头部：`,
      options.header,
      `\n`,
      `请求参数：`,
      options.data,
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
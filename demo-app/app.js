//app.js
import { login, getUserInfo } from "./utils/login.js";
import { getTime, getDate } from "./utils/util.js";
import config from "./utils/config.js";
// 综合了一些常用的库 如请求方法，字段校验等 详可看Chinsen文件夹
import tools from "./utils/Chinsen/index";
console.log(tools, '222')
App({
  common: {
    getTime,
    getDate,
  },
  onLaunch: function () {
    wx.$ajax = this.ajax;
    tools.init(this);
  },

  onShow(options) {
    let _this = this;
    wx.getSystemInfo({
      success: (res) => {
        let modelmes = res.model;
        if (
          modelmes.search("iPhone X") != -1 ||
          modelmes.search("iPhone XR") != -1 ||
          modelmes.search("iPhone XS") != -1 ||
          modelmes.search("iPhone XS Max") != -1
        ) {
          _this.globalData.isFullIphone = true;
        }
      },
    });
  },

  globalData: {
    isFullIphone: false,
    userInfo: null,
  },

  // 跳转登陆页面
  turnToLoginPage: function (type) {
    wx.showModal({
      title: "提示",
      content: "请先登录再进行操作",
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: "/pages/authorizationLogin/authorizationLogin",
          });
        } else if (res.cancel) {
          if (!!type) {
            type == "agency"
              ? wx.switchTab({
                  url: "/pages/member/member",
                })
              : wx.navigateBack({});
            return;
          }
          wx.navigateBack({});
        }
      },
    });
  },

  // 网络请求
  ajax: function (options) {
    let _this = this;
    options.showLoading =
      typeof options.showLoading === "boolean" ? options.showLoading : true;
    options.showErrModal =
      typeof options.showErrModal === "boolean" ? options.showErrModal : true;
    if (options.showLoading) {
      wx.showLoading({
        title: "",
        mask: true,
      });
    }
    return new Promise((resovle, reject) => {
      wx.request({
        url: this.data.url + (options.api || ""),
        data: options.data || {},
        method: options.method || "GET",
        header: options.header || {
          "content-type": "application/json",
        },
        success: function (res) {
          if (
            options.data.action == "GetUserInfoBySessionId" ||
            options.data.action == "GetListShoppingCart"
          ) {
            // wx.showToast({
            //   title: '尚未登录',
            //   icon: 'none',
            //   duration: 2000
            // })
          } else if (
            getCurrentPages()[getCurrentPages().length - 1].route.indexOf(
              "authorizationLogin"
            ) === -1 &&
            (res.data.Status === "login" ||
              res.data.errorMsg === "sessionId为空" ||
              res.data.errorMsg === "用户尚未登录")
          ) {
            wx.showModal({
              title: "提示",
              content: "请先登录再进行操作",
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: "/pages/authorizationLogin/authorizationLogin",
                  });
                } else if (res.cancel) {
                  wx.navigateBack({});
                }
              },
            });
            return;
          }
          resovle(res.data);
        },
        fail: function (e) {
          if (!options.showErrModal) return;
          wx.showModal({
            title: "提示",
            content: "网络错误：[time out]",
            showCancel: false,
          });
        },
        complete: function () {
          if (options.showLoading) {
            wx.hideLoading();
          }
        },
      });
    });
  },

  // 返回分享数据
  getShareData: function () {
    let data =
      wx.getStorageSync("ReferralId") && wx.getStorageSync("ReferralId") != 0
        ? "?ReferralId=" + wx.getStorageSync("ReferralId")
        : "";
    return {
      path: "/pages/index/index" + data,
    };
  },
  data: {
    // 修改url 进入 utils/config去改
    ...config,
  },
});

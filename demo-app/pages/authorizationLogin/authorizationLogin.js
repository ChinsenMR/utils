// pages/authorizationLogin/authorizationLogin.js
// import warrant from '../../utils/login.js'
import { login, getUserInfo, warrant } from "../../utils/login.js";
const app = getApp();
Page({
  /**
   *授权
   **/
  bindGetUserInfo(e) {
    // console.log('加密信息 ' + e.detail.encryptedData)
    // console.log('加密iv ' + e.detail.iv)

    if (e.detail.errMsg === "getUserInfo:ok") {
      console.log(e.detail.userInfo);
      wx.setStorage({
        key: "userInfo",
        data: e.detail.userInfo,
      });
      //等下
      app.globalData.userInfo = e.detail.userInfo;
      wx.showLoading({
        title: "",
        mask: true,
      });
      this.getLogin();
    }
  },

  getLogin: function () {
    let _this = this;
    login((sessionId) => {
      wx.getUserInfo({
        success: function (res) {
          console.log("sessionId " + sessionId);
          wx.request({
            url: getApp().data.url + "/apI/VshopProcess.ashx/ProcessRequest",
            data: {
              action: "EncryptedData",
              sessionId: sessionId,
              encryptedData: res.encryptedData,
              iv: res.iv,
              ReferralId: _this.data.ReferralId,
            },
            success: function (data) {
              wx.hideLoading();
              console.log("userinfo", data.data);
              if (data.data.Status == "success") {
                // wx.showToast({
                //   title: '已绑定推荐人',
                //   duration: 2000
                // })
                setTimeout(() => {
                  wx.navigateBack({
                    delta: 1,
                    success: function (e) {
                      var page = getCurrentPages().pop();
                      if (page == undefined || page == null) return;
                      page.onLoad(page.options);
                    },
                  });
                }, 0);

                wx.setStorageSync("ReferralId", data.data.data.ReferralUserId);
              }

              if (data.data.data && data.data.data.ReferralUserId) {
                wx.setStorageSync("ReferralId", data.data.data.ReferralUserId);
              }
              if (data.data.Status == "BindUser") {
                if (data.data.data.BindData.length > 1) {
                  _this.setData({
                    hasAccounts: true,
                    userIds: data.data.data.BindData,
                  });

                  console.log("合并账号=", data.data);
                } else {
                  wx.navigateBack({
                    delta: 1,
                    success: function (e) {
                      var page = getCurrentPages().pop();
                      if (page == undefined || page == null) return;
                      page.onLoad(page.options);
                    },
                  });
                }
              }
              if (data.data.Status === "fail") {
                // if (count) {
                //   count++
                // } else {
                //   var count = 0
                // }
                wx.showModal({
                  title: "登陆失败",
                  content: data.data.errorMsg,
                  showCancel: false,
                  success: function (e) {},
                });
              }
            },
            fail: function (e) {
              wx.hideLoading();
              wx.showModal({
                title: "登陆失败",
                showCancel: false,
                success: function (e) {},
              });
            },
          });
        },
      });
    });
  },

  /**
   * 页面的初始数据
   */
  data: {
    hasAccounts: false, // 是否有多个账号
    userIds: [], // 账号列表
    bindId: "", // 绑定的id
    mask: false, // 显示遮罩
    ReferralId: "",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.ReferralId) {
      this.data.ReferralId = options.ReferralId;
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        });
      };
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: (res) => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
          });
        },
      });
    }
  },

  // /**
  //  * 生命周期函数--监听页面初次渲染完成
  //  */
  // onReady: function () {

  // },

  // /**
  //  * 生命周期函数--监听页面显示
  //  */
  // onShow: function () {

  // },

  // /**
  //  * 生命周期函数--监听页面隐藏
  //  */
  // onHide: function () {

  // },

  // /**
  //  * 生命周期函数--监听页面卸载
  //  */
  // onUnload: function () {

  // },

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function () {

  // },

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {

  // },

  goPhoneLogin: function () {
    wx.navigateTo({
      url: "/pages/phoneLogin/phoneLogin",
    });
  },
  goUserLogin: function () {
    wx.navigateTo({
      url: "/pages/userLogin/userLogin",
    });
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
    });
  },
  /**
   * 选择账号
   * */
  selectId: function (e) {
    this.setData({
      bindId: e.currentTarget.dataset.id,
    });
  },
  later: function () {
    this.setData({
      hasAccounts: false,
    });
    wx.navigateBack({
      delta: 1,
    });
  },

  sure: function (e) {
    if (!this.data.bindId) {
      wx.showToast({
        title: "请选择主账号",
        icon: "none",
      });
      return;
    }
    let _this = this;
    wx.showLoading({
      title: "",
      mask: true,
    });
    wx.request({
      url: getApp().data.url + "/Api/VshopProcess.ashx?action=BindOtherUser",
      data: {
        bindUserId: this.data.bindId,
        sessionId: wx.getStorageSync("sessionId"),
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function (res) {
        wx.hideLoading();
        console.log("合并", res);
        if (res.data.Status === "success") {
          _this.setData({
            hasAccounts: false,
          });
          _this.getLogin();
        } else {
          wx.showModal({
            title: "提示",
            content: res.data.errorMsg,
            showCancel: false,
            success: function (e) {
              // wx.navigateBack({
              //   delta: 1
              // })
            },
          });
        }
      },
      fail: function (e) {
        wx.hideLoading();
        wx.showModal({
          title: "提示",
          content: "err:[timeout]",
          showCancel: false,
          success: function (e) {
            wx.navigateBack({
              delta: 1,
            });
          },
        });
      },
    });
  },
});

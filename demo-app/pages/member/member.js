// pages/member/member.js

Page({
  /**
   * 页面的初始数据
   */
  data: {
    newsData: {},
    // userInfo: null,
    userData: {}, // 会员相关信息（等级、积分、钱包等）
    showAccount: true,
    signIn: "点击签到",
    memberpoint: 0,
    isPay: false,
    IsSync: true,
    showlogin: true,
    agentUpgradeUrl: "/pages/agentUpgrade/agentUpgrade?issync=false",
    isLogin: wx.getStorageSync("sessionId") ? true : false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function (options) {
  // },

  // /**
  //  * 生命周期函数--监听页面初次渲染完成
  //  */
  // onReady: function () {

  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.setData({
    //   userInfo: getApp().globalData.userInfo
    // })
    this.setData({
      showlogin: true,
    });
    this.getList(1, 5, 0, 0, 0);
    this.getUserData();
    // console.log(this.data.user)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
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

  /**
   * 签到
   * */
  onSignIn: function () {
    console.log(this.data.signIn);
    if (!this.data.userData.UserId) {
      return;
    }
    if (this.data.signIn != "已签到") {
      let _this = this;
      wx.$ajax({
        api: "/API/VshopProcess.ashx/ProcessRequest?action=GetSignToday",
        data: {
          userId: this.data.userData.UserId,
        },
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }).then((res) => {
        if (res.Status === "success") {
          wx.showToast({
            title: res.message,
          });
          var memberpoint = _this.data.userData.Point;
          _this.setData({
            signIn: "已签到",
            memberpoint: res.points,
          });
        } else {
          wx.showToast({
            title: res.message,
            icon: "none",
          });
        }
      });
    } else {
      return;
    }
  },

  getList: function (pageIndex, pageSize, SendType, isDel, isShowRead) {
    var _this = this;
    wx.request({
      url: getApp().data.url + "/apI/VshopProcess.ashx/ProcessRequest",
      data: {
        action: "GetNotic",
        pageIndex: pageIndex,
        pageSize: pageSize,
        SendType: SendType,
        isDel: isDel,
        isShowRead: isShowRead,
        sessionId: wx.getStorageSync("sessionId"),
      },
      success: function (res) {
        if (res.data.Status === "success") {
          _this.newsData = res.data.data;
          _this.setData({
            newsData: res.data.data,
          });
        }
      },
    });
  },

  /**
   * 获取会员相关信息
   * */
  getUserData() {
    wx.$api.getUserInfo().then((res) => {
      if (res.Status === "success") {
        this.setData({ showlogin: false });

        let { signIn } = this.data;

        const {
          isSignToday,
          IsFullAmount,
          Point,
          UserGradeName,
          IsSync,
        } = res.data;

        signIn = isSignToday ? "已签到" : "点击签到";

        if (IsFullAmount) {
          wx.showToast({
            title: "您已具备申请代理会员，请申请吧！",
            icon: "none",
            duration: 1500,
          });
        }

        wx.setStorageSync("UserGradeName", UserGradeName);

        const agentUpgradeUrl =
          "/pages/agentUpgradeWeb/agentUpgradeWeb?issync=" +
          String(Boolean(IsSync));

        this.setData({
          signIn,
          memberpoint: Point,
          userData: res.data,
          isLogin: true,
          IsSync,
          agentUpgradeUrl,
        });
      }
    });

    return;
    wx.$ajax({
      api: "/Api/VshopProcess.ashx",
      data: {
        action: "GetUserInfoBySessionId",
        SessionId: wx.getStorageSync("sessionId"),
      },
    }).then((res) => {
      if (res.Status === "success") {
        _this.setData({
          showlogin: false,
        });
        var signIn = _this.signIn;
        if (res.data.isSignToday) {
          signIn = "已签到";
        } else {
          signIn = "点击签到";
        }
        if (res.data.IsFullAmount) {
          wx.showToast({
            title: "您已具备申请代理会员，请申请吧！",
            icon: "none",
            duration: 1500,
          });
        }
        _this.setData({
          signIn: signIn,
          memberpoint: res.data.Point,
          userData: res.data,
          isLogin: true,
        });
        wx.setStorageSync("UserGradeName", res.data.UserGradeName);
        if (res.data.IsSync) {
          _this.setData({
            IsSync: res.data.IsSync,
            agentUpgradeUrl:
              "/pages/agentUpgradeWeb/agentUpgradeWeb?issync=true",
          });
        } else {
          _this.setData({
            IsSync: res.data.IsSync,
            agentUpgradeUrl: "/pages/agentUpgrade/agentUpgrade?issync=false",
          });
        }
      }
    });
  },

  goMyMessage: function (e) {
    console.log(e);
    var id = e.currentTarget.dataset.id;
    console.log(id);
    wx.navigateTo({
      url: "/pages/myMessage/myMessage?flag=false&noticeid=" + id,
    });
  },

  later: function () {
    this.setData({
      showAccount: false,
    });
  },

  sure: function () {
    this.setData({
      showAccount: false,
    });
    wx.navigateTo({
      url: "",
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {},
    });
  },
});

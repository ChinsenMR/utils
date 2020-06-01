// pages/binding/binding.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    password: ''
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

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },

  /**
   * 获取姓名
   * */
  onGetName: function(e) {
    this.data.name = e.detail.value
  },

  /**
   * 获取密码
   * */
  onGetPassword: function(e) {
    this.data.password = e.detail.value
  },

  /**
   * 绑定按钮处理函数
   * */
  onBinding: function() {
    let rgxPw = /^[a-zA-Z0-9_-]{6,15}$/
    if (this.data.name === "" || 　(/\s+/g).test(this.data.name)) {
      wx.showToast({
        title: '输入的名字不能为空或者含有空格',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!rgxPw.test(this.data.password)) {
      wx.showToast({
        title: '请输入6位以上密码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.httpBinding()
  },

  /**
   * 绑定网络请求
   * */
  httpBinding: function() {
    wx.$ajax({
      api: '/Api/VshopProcess.ashx?action=BindOldUserInfo',
      data: {
        userName: this.data.name,
        password: this.data.password,
        sessionId: wx.getStorageSync('sessionId')
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
    }).then(res => {
      if (res.Status === 'success') {
        wx.navigateBack({
          delta: 1
        })
      } else if (res.Status === 'fail') {
        wx.showToast({
          title: res.errorMsg,
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.showToast({
          title: '绑定失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
})
/* 弹出框 */

module.exports = {
  /* 弹出加载中框 */
  loading(title) {
    wx.showLoading({
      title: title || "加载中...",
      mask: true,
    });
  },

  /* 关闭加载框 */
  closeLoading() {
    wx.hideLoading();
  },

  /* 消息提示 */
  message(msg, title) {
    wx.showModal({
      title: title || "提示",
      content: msg,
      showCancel: false,
    });
  },
  confirm(obj, callback) {
    wx.showModal({
      title: obj.title || "提示",
      content: obj.content || "确认本次操作",
      confirmColor: obj.color || "#0081CC",
      success(res) {
        callback(res.confirm);
      },
    });
  },
  /* 普通提示框 */
  toast(msg) {
    wx.showToast({
      title: msg,
      icon: "none",
    });
  },
  /* 成功提示框 */
  success(msg, done) {
    wx.showToast({
      title: msg,
      icon: "none",
      duration: done || 2000,
    });
  },

  /* 失败提示框 */
  error(msg, done) {
    wx.showToast({
      title: msg,
      image: "/images/close@2x.png",
      duration: done || 2000,
    });
  },
};

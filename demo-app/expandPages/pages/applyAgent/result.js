// pages/addAddress/addAddress.js

const app = getApp();

Page(
  app.tools.initPage({
    data: {
      iconUrl:
        "https://img.hmeshop.cn/hmeshopV3/Storage/master/202005212007185953520.png",
    },
    watch: {},
    setAllData() {
      app.tools.setAllData(this, this.data);
    },
    onReady() {},
    onLoad(options) {
      app.tools.setWatcher(this.data, this.watch);
      this.setData({ params: options });
    },
    onShow() {},
    onShareAppMessage() {},
    onHide() {},
    onPullDownRefresh() {
      console.log("下拉触底");
    },
    onReachBottom() {
      console.log("下拉触底");
    },
    onPageScroll(e) {},
    /**
     * 自定义方法全部放这里
     */
    methods: {
      
      submit() {
        wx.navigateBack({
          delta: 2,
        });
      },
    },
  })
);

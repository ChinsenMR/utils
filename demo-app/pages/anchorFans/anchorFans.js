// pages/addAddress/addAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    FansList: [],
    showType: false,
    page: 0,
    rows: 8,
    isLoading: false,
    isLastPage: false,
    keyword: ''
  },
  changeShowType() {
    this.setData({
      showType: !this.data.showType
    })
    this.getList(1)
  },
  // 获取粉丝列表
  getList(currentPage) {

    let { page, isLastPage, rows, isLoading, keyword, FansList, showType } = this.data;


    if (currentPage) {
      page = 0;
      FansList = [];
      isLastPage = false;
      this.setData({ page, FansList, isLastPage })
    }

    if (isLastPage) { return } else { page++; this.setData({ isLoading: true }) }



    let data = {
      action: 'GetAnchorFansList',
      sessionId: wx.getStorageSync('sessionId'),
      page,
      rows,
      keyword,
      sort: Number(showType)
    }

    wx.$ajax({
      api: '/api/MiniProgramLive/api.ashx',
      data
    }).then(res => {
      if (res.Status === "login" || res.errorMsg === "用户尚未登录") {
        getApp().turnToLoginPage('agency')
        return
      }
      let maxPage = Math.ceil(Number(res.data.TotalCount) / rows) || 1;

      if (page - 1 >= maxPage) { isLastPage = true; }

      FansList = FansList.concat(res.data.FansList)
      // 最终结果
      isLoading = false;

      this.setData({ page, FansList, isLastPage, isLoading })
      wx.stopPullDownRefresh()
    })

  },
  claerContent() {
    this.setData({ keyword: '' });
    this.getList(1)
  },
  clearMessage() {

    this.setData({
      list: [],
    })
  },
  searchFans(e) {
    // console.log(e.detail.value)
    this.setData({ keyword: e.detail.value });
    this.getList(1)
  },
  onPullDownRefresh() {
    this.getList(1);
    console.log('下拉刷新')
  },
  onReachBottom() {
    this.getList();
    console.log('上拉触底')
  },

  onLoad() {
    this.getList();
  }

})
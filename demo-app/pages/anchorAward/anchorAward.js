// pages/addAddress/addAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    TabCur: 0,
    scrollLeft: 0,
    showSlider: false,
    page: 0,
    rows: 6,
    isLastPage: false,
    OrderList: [],
    slider: [],
    checkTabText: '',
    Summary: {

    },
    isLoading: false,
  },
  dialog() {

  },
  showSelect(e) {
    let { id } = e.currentTarget.dataset;
    this.setData({ showSlider: !this.data.showSlider })
  },
  checkTab(e) {
    let { id, text } = e.currentTarget.dataset;

    if (id == '全部') {
      this.getList(1)
    } else {
      this.getList(1, id)
    }
    this.setData({ showSlider: !this.data.showSlider, checkTabText: text })

  },
  tabSelect(e) {
    let { id } = e.currentTarget.dataset;


    this.setData({
      TabCur: id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })

    this.getList(1)

  },

  getList(currentPage, RoomId) {

    let { page, OrderList, isLastPage, rows, isLoading, Summary, TabCur } = this.data;


    if (currentPage) {
      page = 0;
      OrderList = [];
      isLastPage = false;
      this.setData({ page, OrderList, isLastPage })
    }

    if (isLastPage) { return } else { page++; this.setData({ isLoading: true }) }

    let orderStatus = () => {
      switch (TabCur) {
        case 0: return -100; break;
        case 1: return 1; break;
        case 2: return 2; break;
        case 3: return 3; break;
        case 4: return 5; break;
        case 5: return 10; break;
      }
    }

    let data = {
      action: 'GetLiveRewardData',
      sessionId: wx.getStorageSync('sessionId'),
      roomId: RoomId || -100,
      page,
      rows,
      orderStatus: orderStatus()
    }

    wx.$ajax({
      api: '/api/MiniProgramLive/api.ashx',
      data
    }).then(res => {

      if (res.data.Status === "login" || res.data.errorMsg === "用户尚未登录") {
        getApp().turnToLoginPage('agency')
        return
      }
      
      let maxPage = Math.ceil(Number(res.data.TotalCount) / rows) || 1;

      if (page - 1 >= maxPage) { isLastPage = true; }
      Summary = res.data.Summary;
      OrderList = OrderList.concat(res.data.OrderList)
      // 最终结果
      isLoading = false;
      this.setData({ page, OrderList, isLastPage, isLoading, Summary })
      wx.stopPullDownRefresh()
    })

  },
  // 获取下拉列表
  getSlider(roomId) {

    wx.$ajax({
      api: '/api/MiniProgramLive/api.ashx',
      data: {
        action: 'GetAnchorLiveRoomList',
        sessionId: wx.getStorageSync('sessionId'),
        roomId: 1
      }
    }).then(res => {
      let { RoomList } = res.data;
      this.setData({ slider: RoomList })
      // let { LiveDetail, LiveAnchor, LiveProducts } = res.data;

      // this.setData({ LiveDetail, LiveAnchor, LiveProducts })
    })

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
    this.getSlider();
  }


})
// pages/productList/productList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryId: '',
    proList: [],
    dataLength: 0,
    page: 1,
    sort: 'saleprice', // 筛选类型
    thePriceOrder: 'asc',  // asc升序，desc降序
    theAddedTimeOrder: 'asc', // 上架
    theSaleCountOrder: 'asc', // 销量
    theVCountOrder: 'asc',    // 浏览量
    theOrder: 'asc'           // 传给服务器的排序
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.data.categoryId = options.typeId || 0
    wx.showLoading({
      title: '加载中...',
    })
    this.getDataList('asc')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.dataLength === 10) {
      this.data.page++
      this.getDataList(this.data.theOrder)
    } else {
      console.log('没 了')
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // },

  /**
   * 进入详情页
   * */ 
  onToDetailPage: function(e){
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/productDetail/productDetail?id='+e.currentTarget.dataset.id,
    })
  },

  /**
   * 修改升降序
   * */ 
   changeTheOrder: function(data){
     switch (data) {
       case 'saleprice':
         this.data.thePriceOrder = this.data.thePriceOrder == 'asc' ? 'desc' : 'asc'
         return this.data.thePriceOrder
       case 'addedDate':
         this.data.theAddedTimeOrder = this.data.theAddedTimeOrder == 'asc' ? 'desc' : 'asc'
         return this.data.theAddedTimeOrder
       case 'showsaleCounts':
         this.data.theSaleCountOrder = this.data.theSaleCountOrder == 'asc' ? 'desc' : 'asc'
         return this.data.theSaleCountOrder
       case 'VistiCounts':
         this.data.theVCountOrder = this.data.theVCountOrder == 'asc' ? 'desc' : 'asc'
         return this.data.theVCountOrder
     }
   },

  /**
   * 选择筛选项
   * */
  onSelectSort: function (e) {
    if (this.data.sort == e.currentTarget.dataset.type) {
      this.data.theOrder = this.changeTheOrder(e.currentTarget.dataset.type)
    } else {
      this.data.page = 1
      this.data.sort = e.currentTarget.dataset.type
      this.data.thePriceOrder = 'asc'
      this.data.theAddedTimeOrder = 'asc'
      this.data.theSaleCountOrder = 'asc'
      this.data.theVCountOrder = 'asc'
      this.data.theOrder = 'asc'
    }
    
    this.data.proList = []
    this.setData({
      sort: this.data.sort,
      thePriceOrder: this.data.thePriceOrder,
      theAddedTimeOrder: this.data.theAddedTimeOrder,
      theSaleCountOrder: this.data.theSaleCountOrder,
      theVCountOrder: this.data.theVCountOrder
    })
    if (this.data.isEmpty) {
      return
    }
    this.getDataList(this.data.theOrder)
  },

  /**
   * 进入搜索页
   * */ 
  onToSeachPage: function(e){
    if (e.target.dataset.page === 'search') {
      console.log(e)
      wx.navigateTo({
        url: '/pages/search/search',
      })
    }
  },

  /**
  * 获取商品列表
  * */
  getDataList: function (order) {
    var _this = this
    wx.$ajax({
      api: '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetSearch',
        categoryId: this.data.categoryId,
        sort: this.data.sort,
        order: order,
        keyWord: '',
        page: this.data.page,
        size: 10,
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res=>{
      console.log(res)
      if (res.Status === 'success') {
        _this.data.dataLength = res.data.length
        _this.data.proList = _this.data.proList.concat(res.data)
        _this.setData({
          proList: _this.data.proList,
          isEmpty: _this.data.proList.length ? false : true
        })
      } else {
        // wx.showToast({
        //   title: res.errorMsg,
        //   icon: 'none'
        // })
        console.log('数据出错')
        _this.data.dataLength = 0
        _this.setData({
          isEmpty: _this.data.proList.length ? false : true
        })
      }
    })
  }
})
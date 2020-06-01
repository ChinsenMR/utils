// pages/fuAgentOrder/fuAgentOrder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    finsh:false,
    dataList:[],
    kuaiDi:[],
    show:false,
    show01:false,
    postVal:{
      CompanyName:'',
      CompanyCode:'',
      ShiporderNumber:'',
      OrderId:''
    },
    UserGradeName:''
  },

  chooseFN(e){
    console.log(e.currentTarget.dataset.status);
   if (e.currentTarget.dataset.status){
    this.setData({
      show:true,
      ['postVal.OrderId']:e.currentTarget.dataset.oid,
    })
    }
  },
  closeFN01(){
    this.setData({
      show:false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      UserGradeName:options.UserGradeName?options.UserGradeName:''
    })
    this.getData()
    this.getWuLiu()
  },
  closeFN(){
    this.setData({
      show01:false,
    })
  },
  chooseKD(e){
    let a=e.currentTarget.dataset.data,data=this.data,that=this
    data.postVal.CompanyName=a.name
    data.postVal.CompanyCode=a.code

    this.setData({
      show01:false,
      postVal:data.postVal,
    })
  },

  // 
  inputFN(e){
    this.setData({
      [e.currentTarget.dataset.name]:e.detail.value
    })
  },

  // 
  submitFN(){
    let data=this.data,that=this
    wx.$ajax({
      api: '/API/VshopProcess.ashx',
      data: {
        Action: 'SummitSendGoodInfo',
        CompanyName:data.postVal.CompanyName,
        CompanyCode:data.postVal.CompanyCode,
        ShiporderNumber:data.postVal.ShiporderNumber,
        OrderId:data.postVal.OrderId,
        sessionId: wx.getStorageSync('sessionId')
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
    }).then(res=>{
      console.log(res);
      if(res.type==1)
      {
        wx.showModal({
          title: '提示',
          content: res.tips,
          showCancel: false
        })
        that.setData({
          dataList: [],
          page: 1,
          finsh: false
        })
        that.setData({ show: false });
        that.getData();
      }
      else{
        wx.showModal({
          title: '提示',
          content: res.tips,
          showCancel: false
        })

      }
    })
  },


  // 
  getData()
  {
    let data=this.data,that=this
    if(data.finsh) return
    wx.$ajax({
      api: '/API/VshopProcess.ashx',
      data: {
        Action: 'GetDistributorBranchPayOrder',
        PageIndex:data.page,
        PageSize:10,
        sessionId: wx.getStorageSync('sessionId')
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
    }).then(res=>{
      console.log(res)
      if(res.Status=="success"){
        res.data.forEach(c=>{
          data.dataList.push(c)
        })
        that.setData({
          page:++data.page,
          dataList:data.dataList,
          finsh:res.data.length<10?true:false,
        })
      }else {
        wx.showModal({
          title: '提示',
          content: res.errorMsg,
          showCancel: false
        })
      }
       
      
    })
  },

  // 
  getWuLiu(){
    let data=this.data,that=this
    wx.$ajax({
      api: '/API/VshopProcess.ashx',
      data: {
        Action: 'GetLogisticsType',
        sessionId: wx.getStorageSync('sessionId')
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
    }).then(res=>{
      that.setData({
       kuaiDi:res[0].data
      })
      
    })

  },

  openFN(){
    this.setData({
      show01:true,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {


  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("getdata");
    this.getData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
// pages/shippingAddress/shippingAddress.js
import {
  turnToLoginPage
} from '../../utils/login.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [],
    IsDefault: false, //是否默认
    addrListType: 0 // 0是从个人中心进来，1是从确定订单页进来
  },

  // 设置默认
  bindRadioAddressChange: function (e) {
    console.log(e)
    var index = e.detail.value,
      _this = this
    console.log(_this.data.addressList[index].ShippingId)
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx?action=SetDefaultAddress',
      data: {
        sessionId: wx.getStorageSync('sessionId'),
        shipId: _this.data.addressList[index].ShippingId
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.Status === 'login') {
          turnToLoginPage()
        }
        if (res.data.Status === 'success') {
          wx.showToast({
            title: res.data.errorMsg,
          })
          _this.getList()
        }
      },
      fail: function (e) {
        console.log(e)
      }
    })
  },

  // 选择地址
  backConfirmOrder: function (e) {
    if (this.data.addrListType === 1) {
      var index = e.currentTarget.dataset.index
      wx.setStorageSync('address', JSON.stringify(this.data.addressList[index]))
      wx.navigateBack({

      })
    }
  },

  /**
    * 新增地址按钮处理函数
    * */
  onToAddPage: function (event) {
    wx.navigateTo({
      url: '/pages/addAddress/addAddress?type=0',
    })
  },

  /**
   * 编辑按钮处理函数
   * 
  */
  onEdit: function (e) {
    console.log(e)
    var index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '/pages/addAddress/addAddress?type=1&address=' + JSON.stringify(this.data.addressList[index]),
    })
  },

  /**
   * 删除按钮处理函数
   * 
  */
  onDelete: function (e) {
    var _this = this
    wx.showModal({
      title: '提示',
      content: '您确定删除该条地址？',
      success: function (res) {
        if (res.confirm) {
          var index = e.currentTarget.dataset.index
          wx.request({
            url: getApp().data.url + '/Api/VshopProcess.ashx?action=DeleteShippingAddress',
            data: {
              shipId: _this.data.addressList[index].ShippingId,
              sessionId: wx.getStorageSync('sessionId')
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: (data) => {
              if (data.data.Status === 'success') {
                if (_this.data.addressList[index].IsDefault === 'True') {
                  wx.showModal({
                    title: '',
                    showCancel: false,
                    content: '您删除的是默认地址，请重新设置默认收货地址'
                  })
                } else {
                  wx.showToast({
                    title: '删除成功',
                    icon: 'none',
                    duration: 2000
                  })
                }
                _this.data.addressList.splice(index, 1)
                _this.setData({
                  addressList: _this.data.addressList
                })
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      addrListType: parseInt(options.type)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady: function (options) {
  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showLoading({
      title: '加载中'
    })
    this.getList()
  },

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
  // 获取地址列表
  getList: function () {
    var _this = this
    wx.$ajax({
      api: '/Api/VshopProcess.ashx',
      data: {
        action: 'GetShippingAddressList',
        pageIndex: 1,
        pageSize: 100,
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      if (res.Status == 'success') {
        // _this.addressList = res.data.data
        _this.setData({
          addressList: res.data
        })
      }
    })
  },

  // 获取地址
  getAddress() {
    let that=this
    wx.chooseAddress({
      success(res) {
        console.log(res,'=====');
        wx.request({
          url:getApp().data.url + '/Api/VshopProcess.ashx?action=GetRegionIdByName',
          data:{
            county:res.countyName,
            city:res.cityName,
            province:res.provinceName
          },
          success(c){
            if(!c.data.success){
              wx.showToast({
                title: '新增地址失败',
                icon: 'none',
                duration: 2000
              })
              return
            }
            wx.request({
              url: getApp().data.url + '/Api/VshopProcess.ashx?action=AddMyShippingAddress',
              data: {
                shipTo: res.userName,
                phone: res.telNumber,
                regionId: c.data.regionid,
                address: res.detailInfo,
                sessionId: wx.getStorageSync('sessionId')
              },
              header: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              method: 'POST',
              success: (data) => {
                that.getList()
    
              },
              fail: (e) => {
                console.log(e)
                wx.showToast({
                  title: '新增地址失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          },
        })

        
      }
    })
  },


})
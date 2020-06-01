// pages/smashedGoldenEggs/smashedGoldenEggs.js
import {
  getGameInfo,
  getPrizeList,
  getDrawPriceResult
} from '../../utils/game.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: true, // 显示中奖信息
    openEgg: false,
    isStart: false, // 是否已开始游戏 
    imgUrl: 'https://hmeshop-1256233971.cos.ap-guangzhou.myqcloud.com/wxapp/images/zajindan02.gif',
    isEmpty: true, // 显示未中奖信息
    finalPrize: {}, // 中奖结果
    gameId: -1, // 游戏id
    baseData: {}, // 基本信息
    prizeData: [], // 奖品列表
    isClicked: false // 抽奖开关
  },

  /**
   * 开始砸蛋
   * */ 
  bindStartGame: function (e) {
    if (this.data.isStart) {
      return
    }
    
    if (this.data.baseData.TodayCanPlayTime <= 0) {
      wx.showModal({
        title: '提示',
        content: `您今天游戏的次数已用玩`,
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    this.data.isStart = true
    
    getDrawPriceResult({
      gameid: this.data.gameId,
      sessionId: wx.getStorageSync('sessionId')
    }).then(res => {
        console.log('结果', res)
        if (res.Status === 0) {
          --this.data.baseData.TodayCanPlayTime
          this.setData({
            baseData: this.data.baseData,
            openEgg: true,
            imgUrl: this.data.imgUrl + '?' + (new Date()).getTime()
          })
          if (res.Data.PrizeName == '未中奖') {
            setTimeout(() => {
              this.setData({
                isEmpty: false
              })
            }, 1300)
          } else {
            this.data.prizeData.map(el => {
              if (el.PrizeName === res.Data.PrizeName) {
                this.setData({
                  finalPrize: {
                    Prize: el.Prize,
                    PrizeImage: el.PrizeImage
                  }
                })
              }
            })
            setTimeout(() => {
              this.setData({
                flag: false
              })
            }, 1300)
          }
        }
      })
  },

  /**
   * 获取游戏基本信息
   * */
  getBaseData: function () {
    getGameInfo({
      gameId: this.data.gameId,
      sessionId: wx.getStorageSync('sessionId')
    }).then(res => {
      console.log('base ', res)
      if (res.Status === 0) {
        if (res.Data.BeginTime.indexOf('T') != -1) {
          res.Data.BeginTime = res.Data.BeginTime.split('T')[0]
        }
        if (res.Data.EndTime.indexOf('T') != -1) {
          res.Data.EndTime = res.Data.EndTime.split('T')[0]
        }
        this.setData({
          baseData: res.Data
        })
      }
    }).catch(e => {
      console.log(e)
    })
  },

  conceal: function () {
    this.data.isStart = false
    this.setData({
      flag: true,
      isEmpty: true
    })
  },

  myCatchTouch: function () {
    return;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('id', options.id)
    this.data.gameId = options.id
    this.getBaseData()
    getPrizeList({
      gameId: this.data.gameId
    }).then(res => {
      console.log('奖品列表 ', res)
      this.setData({
        prizeData: res.Data
      })
    }).catch(e => {
      console.log(e)
    })
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

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {
  
  // },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {
  
  // }
})
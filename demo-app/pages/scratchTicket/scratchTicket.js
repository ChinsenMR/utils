// pages/scratchTicket/scratchTicket.js
import Scratch from "../../components/scratch/scratch.js"
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
    isGameOver: false, // 游戏是否结束
    gameCount: 2,   // 游戏次数
    finalPrize: {}, // 中奖结果
    gameId: -1, // 游戏id            
    baseData: {}, // 基本信息
    prizeData: [], // 奖品列表
  },


  /**
   * 再玩一次
   * */ 
  onOnceAgain: function () {
    if (!this.data.isGameOver) {
      wx.showModal({
        title: '提示',
        content: `本次游戏未结束，请继续！`,
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
    if (this.data.gameCount === 0) {
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
    getDrawPriceResult({
      gameid: this.data.gameId,
      sessionId: wx.getStorageSync('sessionId')
    }).then(res => {
      console.log('结果', res)
      this.data.finalPrize = res.Data
      this.scratch.restart(res.Data.PrizeName)
      // this.data.scratch.awardTxt = res.Data.PrizeName
      // this.setData({
      //   scratch: this.data.scratch
      // })
    })
    this.data.isGameOver = false
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
          res.Data.BeginTime = res.Data.BeginTime.replace('T', ' ')
        }
        if (res.Data.EndTime.indexOf('T') != -1) {
          res.Data.EndTime = res.Data.EndTime.replace('T', ' ')
        }
        this.setData({
          baseData: res.Data
        })
      }
    }).catch(e => {
      console.log(e)
    })
  },

  createGame: function(){
    this.scratch = new Scratch(this, {
      canvasWidth: 335,
      canvasHeight: 150,
      imageResource: 'https://misc.aotu.io/pfan123/wx/placeholder.png',
      maskColor: "red",
      r: 4,
      awardTxt: this.data.finalPrize.PrizeName,
      awardTxtColor: "#3985ff",
      awardTxtFontSize: "24px",
      callback: () => {
        wx.showModal({
          title: '提示',
          content: this.data.finalPrize.PrizeName,
          showCancel: false,
          success: (res) => {
            this.setData({
              isGameOver: true,
              gameCount: --this.data.gameCount
            })
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    })
    this.scratch.start()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.gameId = 2
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
    this.getBaseData()
    getDrawPriceResult({
      gameid: this.data.gameId,
      sessionId: wx.getStorageSync('sessionId')
    }).then(res => {
      console.log('结果', res)
      this.data.finalPrize = res.Data
      this.createGame()
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})
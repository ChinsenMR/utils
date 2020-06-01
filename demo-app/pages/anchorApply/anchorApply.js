// pages/addAddress/addAddress.js



const app = getApp();
const { getTime, getDate } = app.common;
Page({

  /**
   * 页面的初始数据
   */

  data: {
    form: {
      shareCardImg: '',
      roomImg: '',
      startTime: getTime(),
      endTime: '请选择',
      liveTitle: '',
      isToday: true,
      anchorNickName: '',
      anchorWechatNo: '',
      canComment: true,
      date: getDate(),
      products: [],
    },
    includeProducts: [],
    time: getTime(),
    date: getDate(),
    modalName: '',
    checkedAll: false,

  },
  DelImg(e) {
    let { type } = e.currentTarget.dataset;
    if (type == 1) {
      this.setData({
        'form.shareCardImg': ''
      })
    } else {
      this.setData({
        'form.roomImg': ''
      })
    }

  },
  DateChange(e) {
    this.setData({
      'form.date': e.detail.value
    })
  },
  TimeChange(e) {
    let { type } = e.currentTarget.dataset;
    if (type == 1) {
      this.setData({
        'form.startTime': e.detail.value
      })
    } else {
      this.setData({
        'form.endTime': e.detail.value
      })
    }

  },
  remove(e) {
    let that = this;
    let { index } = e.currentTarget.dataset;
    that.data.form.products.splice(index, 1);
    that.setData({
      'form.products': that.data.form.products
    })
  },
  ChooseImage(e) {
    let that = this;
    let { type } = e.currentTarget.dataset;


    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        that.upLoadImg(res.tempFilePaths[0]).then(res => {
          if (type == 1) {
            that.setData({ 'form.shareCardImg': res.data })
          } else {
            that.setData({ 'form.roomImg': res.data })
          }
        });

      }
    });
    1
  },
  addGooods() {

    let { includeProducts, form } = this.data;
    form.products = [];
    includeProducts.map(d => {
      if (d.checked) {
        form.products.push(d);
      }
    })
    this.setData({
      'form.products': form.products,
      showModal: false,
      modalName: ''
    })
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  inputText(e) {
    let { type } = e.currentTarget.dataset;
    let { value } = e.detail;

    let { liveTitle, anchorNickName, anchorWechatNo } = this.data.form;
    switch (type) {
      case 'liveTitle': liveTitle = value; break;
      case 'anchorNickName': anchorNickName = value; break;
      case 'anchorWechatNo': anchorWechatNo = value; break;

    };
    this.setData({
      'form.liveTitle': liveTitle,
      'form.anchorNickName': anchorNickName,
      'form.anchorWechatNo': anchorWechatNo,
    })
    console.log(this.data.form)
  },
  changeSwitch(e) {
    let { type, index } = e.currentTarget.dataset;
    if (type == 1) {
      this.setData({
        'form.isToday': !this.data.form.isToday
      })
    } else if (type == 2) {
      this.setData({
        'form.canComment': !this.data.form.canComment
      })
    } else if (type == 'goods') {

      this.data.includeProducts[index].checked = !this.data.includeProducts[index].checked;

      this.setData({
        includeProducts: this.data.includeProducts
      })
    } else if (type == 'selectAll') {

      this.data.checkedAll = !this.data.checkedAll;

      let temp = this.data.includeProducts;

      temp.forEach(d => { d.checked = this.data.checkedAll });

      this.setData({
        checkedAll: this.data.checkedAll,
        includeProducts: temp
      })

    }

  },
  // getImg(path) {



  // },
  /**
 * 上传图片
 * */
  upLoadImg(path) {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '图片上传中',
        mask: true
      })
      wx.uploadFile({
        url: app.data.url + '/Api/VshopProcess.ashx?action=UpLoadHead',
        filePath: path,
        name: 'file',
        header: {
          "Content-Type": "multipart/form-data"
        },
        formData: {
          'Type': 1, // 1个人资料,2店铺
          'sessionId': wx.getStorageSync('sessionId')
        },
        success: function (res) {
          wx.hideLoading()

          if (res.data.Status === "login" || res.data.errorMsg === "用户尚未登录") {
            getApp().turnToLoginPage('agency')
            return
          }

          if (res.statusCode != 200) {
            wx.showModal({
              title: '提示',
              content: '上传失败',
              showCancel: false
            })
            return;
          }

          let resData = JSON.parse(res.data)

          if (resData.Status === 'success') {
            resolve(resData)

          } else {
            wx.showModal({
              title: '提示',
              content: resData.errorMsg,
              showCancel: false
            })
          }

        },
        fail: function (e) {
          wx.hideLoading()
          console.log(e)
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          })
        }
      })
    })

  },


  // 获取下拉列表
  getProductList() {
    wx.$ajax({
      api: '/api/MiniProgramLive/api.ashx',
      data: {
        action: 'GetLiveProductList',
        sessionId: wx.getStorageSync('sessionId'),
        rows: 200
      }
    }).then(res => {
      let { LiveProductList } = res.data;
      LiveProductList.map(d => {
        d.checked = false;
      })
      this.setData({
        includeProducts: res.data.LiveProductList
      })
    })



  },
  submit() {

    let {
      shareCardImg,
      roomImg,
      startTime,
      endTime,
      liveTitle,
      anchorNickName,
      anchorWechatNo,
      canComment,
      date,
      isToday,
      products
    } = this.data.form;

    let relateProductIds = () => {
      let r = [];
      products.map(d => {
        r.push(d.ProductID);
      })
      return r;
    }

    if (!shareCardImg) {
      wx.alert.error('请上传分享卡片')
      return
    }
    if (!roomImg) {
      wx.alert.error('请上传分享卡片')
      return
    }
    if (!liveTitle) {
      wx.alert.error('主播标题未填写')
      return
    }

    if (!endTime || endTime == '请选择') {
      wx.alert.error('请选择结束时间')
      return
    } else {
      let td = new Date();

      console.log(String(date) + ' ' + String(startTime))
      let start = new Date(String(date) + ' ' + String(startTime)).getTime() / 1000;
      let end = new Date(String(date) + ' ' + String(endTime)).getTime() / 1000;
      let now = new Date(String(date) + ' ' + td.getHours() + ':' + td.getMinutes()).getTime() / 1000;
      let min = 3600 // 一小时;



      console.log(start + '--' + now + min)
      if (isToday) {
        if (start < (now + min)) {
          wx.alert.error('请提前一小时')
          return
        }
      }



      if (end - start < min) {
        wx.alert.error('最少一小时')
        return
      }

      if (start > end) {
        wx.alert.error('开始时间错误');
        return
      }

    }

    if (!anchorNickName) {
      wx.alert.error('主播昵称未填写')
      return
    }
    if (!anchorWechatNo) {
      wx.alert.error('主播微信未填写')
      return
    }

    let data = {
      action: 'DoOpenLiveRoomApply',
      sessionId: wx.getStorageSync('sessionId'),
      shareCardImg,
      roomImg,
      startTime: date + ' ' + startTime,
      endTime: date + ' ' + endTime,
      liveTitle,
      anchorNickName: anchorNickName,
      anchorWechatNo: anchorWechatNo,
      canComment: Number(canComment),
      relateProductIds: relateProductIds().join(',')
    }




    wx.$ajax({
      api: '/api/MiniProgramLive/api.ashx',
      data
    }).then(res => {
      if (res.Status === 'success') {
        wx.alert.success('提交成功');
        var pages = getCurrentPages(); //当前页面
        var beforePage = pages[pages.length - 2]; //前一页
        setTimeout(() => {
          wx.navigateBack({
            success: function () {
              beforePage.onLoad(); // 执行前一个页面的onLoad方法
            }
          });
        }, 2000)
      } else {
        wx.alert.error(res.errorMsg);
      }

    })

  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })

  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },
  onLoad() {
    this.getProductList();
  }
})
// pages/cart/cart.js
import { turnToLoginPage } from "../../utils/login.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    discountMoney: 0, // 优惠金额
    num: 1,
    ischecked: false,
    cartData: {},
    selectItems: [],
    isPlus: false, // 是否已按下加
    isReduce: false, // 是否已按下减
    totalMoney: 0, // 总金额
    totalCount: 0, // 总数量
    isAllchecked: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: "加载中",
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getDataList();
    this.setData({
      selectItems: [],
      ischecked: false,
      totalCount: 0,
      totalMoney: 0,
      discountMoney: 0,
    });
    wx.removeStorageSync("confirmOrder");
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

  checkboxAllChange: function (e) {
    var list = this.data.cartData;
    for (var item in list.data) {
      list.data[item].ischecked = !list.data[item].isSelected;
      list.data[item].isSelected = !list.data[item].isSelected;
      let arr = list.data.filter((el) => el.isSelected);
      this.data.selectItems = arr;
      console.log(arr);
      let total = this.total(arr);
      this.data.discountMoney = this.computeDiscounts(arr);
      this.setData({
        totalCount: total.itemCount,
        discountMoney: this.data.discountMoney,
        totalMoney: (
          total.totalPrice * 1 -
          this.data.discountMoney * 1
        ).toFixed(2),
      });
      if (!list.data[item].isSelected) continue;
      var LimitedTimeDiscountInfo = list.data[item].LimitedTimeDiscountInfo[0];
      if (LimitedTimeDiscountInfo == null) continue;
      if (
        LimitedTimeDiscountInfo.LimitNumber <=
        parseInt(list.data[item].Quantity)
      ) {
        wx.showToast({
          title:
            "当前商品限购" +
            LimitedTimeDiscountInfo.LimitNumber +
            "件！超出恢复原价",
          icon: "none",
          duration: 1500,
        });
      }
    }

    this.setData({
      cartData: list,
      ischecked: !this.data.ischecked,
    });
  },
  /**
   * 选择商品
   * */
  checkboxChange: function (e) {
    this.data.cartData.data[e.currentTarget.dataset.index].isSelected = !this
      .data.cartData.data[e.currentTarget.dataset.index].isSelected;
    let arr = this.data.cartData.data.filter((el) => el.isSelected);
    this.data.selectItems = arr;
    console.log(arr);
    let total = this.total(arr);
    this.data.discountMoney = this.computeDiscounts(arr);
    this.setData({
      totalCount: total.itemCount,
      discountMoney: this.data.discountMoney,
      totalMoney: (total.totalPrice * 1 - this.data.discountMoney * 1).toFixed(
        2
      ),
    });
    if (!this.data.cartData.data[e.currentTarget.dataset.index].isSelected)
      return;
    var LimitedTimeDiscountInfo = this.data.cartData.data[
      e.currentTarget.dataset.index
    ].LimitedTimeDiscountInfo[0];
    if (LimitedTimeDiscountInfo == null) return;
    if (
      LimitedTimeDiscountInfo.LimitNumber <=
      parseInt(this.data.cartData.data[e.currentTarget.dataset.index].Quantity)
    ) {
      wx.showToast({
        title:
          "当前商品限购" +
          LimitedTimeDiscountInfo.LimitNumber +
          "件！超出恢复原价",
        icon: "none",
        duration: 1500,
      });
    }
  },

  /**
   * 计算优惠总金额
   * */
  computeDiscounts: function (arr) {
    console.log("优惠", arr);

    var sum = 0;
    if (arr.length) {
      for (var el of arr) {
        var discountMoney = 0;
        if (!el.isSelected) {
          continue;
        }
        for (var element of el.Activities) {
          if (
            element.MeetMoney > 0 &&
            el.Quantity * el.Price >= element.MeetMoney
          ) {
            discountMoney = element.ReductionMoney;
            break;
          }
        }
        sum += discountMoney;
      }
    }
    return sum;
  },

  /**
   * 进入详情页
   * */
  onTodDetailPage: function (e) {
    console.log(e);
    wx.navigateTo({
      url:
        "/pages/productDetail/productDetail?id=" + e.currentTarget.dataset.id,
    });
  },

  /**
   * 进入确认订单页
   * */
  goOrder: function () {
    if (!this.data.selectItems.length) {
      wx.showToast({
        title: "请选择结算商品",
        icon: "none",
      });
      return;
    }
    wx.setStorage({
      key: "confirmOrder",
      data: JSON.stringify({
        data: this.data.cartData.data.filter((el) => el.isSelected),
        itemCount: this.data.totalCount,
        totalPrice: this.data.totalMoney,
        discountMoney: this.data.discountMoney,
      }),
    });
    wx.navigateTo({
      url: "/pages/confirmOrder/confirmOrder",
    });
  },

  /* 获取购物车列表 */
  getDataList() {
    const formData = {
      pageIndex: 1,
      pageSize: 100,
    };

    wx.$api.getCart(formData).then((res) => {
      if (res.data.Status === "success") {
        this.setData({
          cartData: res.data,
        });
      }
    });
  },

  // 减法
  minus: function (e) {
    console.log("减法", this.data.isReduce);
    if (this.data.isReduce) {
      return;
    }
    var index = e.currentTarget.dataset.index;
    console.log("减法数量", this.data.cartData.data[index].Quantity);
    if (this.data.cartData.data[index].Quantity == 1) {
      return;
    }
    this.data.isReduce = true;
    this.ChangeCart(
      {
        skuid: e.currentTarget.dataset.skuid,
        quantity: parseInt(this.data.cartData.data[index].Quantity) - 1,
      },
      (res) => {
        console.log("减", res);
        this.data.isReduce = false;
        if (res.Status === "success") {
          if (res.errorMsg) {
            wx.showToast({
              title: res.errorMsg,
              icon: "none",
            });
            this.data.cartData.data[index].Quantity = this.data.cartData.data[
              index
            ].Stock;
          } else {
            this.data.cartData.data[index].Quantity--;
          }
          let arr = this.data.cartData.data.filter((el) => el.isSelected);
          let totalData = this.total(arr);
          this.data.discountMoney = this.computeDiscounts(arr);
          this.setData({
            totalCount: totalData.itemCount,
            discountMoney: this.data.discountMoney,
            totalMoney: totalData.totalPrice * 1 - this.data.discountMoney * 1,
            cartData: this.data.cartData,
          });
        } else {
          console.log("数据错误");
          wx.showToast({
            title: res.errorMsg,
          });
        }
      }
    );
  },

  // 加法
  add: function (e) {
    if (this.data.isPlus) {
      return;
    }
    this.data.isPlus = true;
    var index = e.currentTarget.dataset.index;
    this.ChangeCart(
      {
        skuid: e.currentTarget.dataset.skuid,
        quantity: parseInt(this.data.cartData.data[index].Quantity) + 1,
      },
      (res) => {
        console.log(res);
        this.data.isPlus = false;
        if (res.Status === "success") {
          if (res.errorMsg) {
            wx.showToast({
              title: res.errorMsg,
              icon: "none",
            });
            this.data.cartData.data[index].Quantity = this.data.cartData.data[
              index
            ].Stock;
          } else {
            this.data.cartData.data[index].Quantity++;
          }
          let arr = this.data.cartData.data.filter((el) => el.isSelected);
          let totalData = this.total(arr);
          this.data.discountMoney = this.computeDiscounts(arr);
          this.setData({
            discountMoney: this.data.discountMoney,
            totalCount: totalData.itemCount,
            totalMoney: totalData.totalPrice * 1 - this.data.discountMoney * 1,
            cartData: this.data.cartData,
          });
        } else {
          console.log("数据错误");
        }
      }
    );
  },

  // 计算总价和总数量
  total: function (arr) {
    var itemCount = 0;
    var totalPrice = 0;
    for (var i = 0; i < arr.length; i++) {
      itemCount += parseInt(arr[i].Quantity);
      totalPrice += parseFloat(arr[i].Price) * parseInt(arr[i].Quantity);
    }
    return {
      itemCount: itemCount,
      totalPrice: totalPrice.toFixed(2),
    };
  },

  // 删除订单
  remove(e) {
    console.log(e.currentTarget);
    var _this = this;
    wx.showModal({
      title: "提示",
      content: "您确定删除该商品？",
      success: function (res) {
        if (res.confirm) {
          var index = e.currentTarget.dataset.index;
          _this.DeleteCart(e.currentTarget.dataset.skuid, (res) => {
            if (res.data.Status === "success") {
              _this.data.cartData.data.splice(index, 1);
              let arr = _this.data.cartData.data.filter((el) => el.isSelected);
              let totalData = _this.total(arr);
              _this.data.discountMoney = _this.computeDiscounts(arr);
              _this.setData({
                discountMoney: _this.data.discountMoney,
                totalCount: totalData.itemCount,
                totalMoney:
                  totalData.totalPrice * 1 - _this.data.discountMoney * 1,
                cartData: _this.data.cartData,
              });
              wx.showToast({
                title: "删除成功",
              });
            } else {
              console.log("删除失败，返回fail", res.data);
            }
          });
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      },
    });
  },

  /**
   * 删除购物车请求
   **/
  DeleteCart: function (skuid, callback) {
    wx.request({
      url:
        getApp().data.url +
        "/Api/VshopProcess.ashx?action=DeleteShopCartProduct",
      data: {
        skuId: skuid,
        type: 0,
        limitedTimeDiscountId: 0,
        sessionId: wx.getStorageSync("sessionId"),
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      success: function (res) {
        // 登陆
        if (res.data.Status === "login") {
          turnToLoginPage();
        }
        callback(res);
      },
      fail: function (err) {
        console.log(err);
      },
    });
  },

  /**
   * 修改购物车
   * */
  ChangeCart: function (data, callback) {
    wx.request({
      url: getApp().data.url + "/Api/VshopProcess.ashx?action=SetShopCartQty",
      data: {
        skuId: data.skuid,
        quantity: data.quantity,
        type: 0,
        exchangeId: 0,
        sessionId: wx.getStorageSync("sessionId"),
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      success: function (res) {
        // 登陆
        if (res.data.Status === "login") {
          turnToLoginPage();
        }
        callback(res.data);
      },
      fail: function (err) {
        console.log(err);
      },
    });
  },
});

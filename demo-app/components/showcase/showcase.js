// components/showcase/showcase.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showCaseList: {
      type: Object,
      value: {},
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    jumptap: function (e) {
      console.log(e);
      let linkData = e.currentTarget.dataset.type;
      let index = e.currentTarget.dataset.index;
      console.log(linkData);
      let id, link, wxltype;
      switch (linkData) {
        case 1:
          id = this.properties.showCaseList.content.dataset[index].item_id;
          wx.navigateTo({
            url: "/pages/productDetail/productDetail?id=" + id,
          });
          break;
        case 2:
          id = this.properties.showCaseList.content.dataset[index].item_id;
          wx.navigateTo({
            url: "/pages/couponDetail/couponDetail?id=" + id,
          });
          break;
        case 3:
          id = this.properties.showCaseList.content.dataset[index].item_id;
          wx.navigateTo({
            url: "/pages/productList/productList?typeId=" + id,
          });
          break;
        case 5:
          id = this.properties.showCaseList.content.dataset[index].item_id;
          var gameType = parseFloat(
            this.properties.showCaseList.content.dataset[index].gameType
          );
          console.log(typeof gameType);
          switch (gameType) {
            //幸运大转盘
            case 0:
              wx.navigateTo({
                url: "/pages/lottery/lottery?id=" + id,
              });
              break;
            //疯狂砸金蛋
            case 1:
              wx.navigateTo({
                url: "/pages/smashedGoldenEggs/smashedGoldenEggs?id=" + id,
              });
              break;
            //好运翻翻看
            case 2:
              wx.navigateTo({
                url: "/pages/turnBrand/turnBrand?id=" + id,
              });
              break;
            //大富翁
            case 3:
              wx.navigateTo({
                url: "/pages/zillionaire/zillionaire?id=" + id,
              });
              break;
            //刮刮乐
            case 4:
              wx.navigateTo({
                url: "/pages/scratchTicket/scratchTicket?id=" + id,
              });
              break;
          }
          break;
        case 6:
          link = this.properties.showCaseList.content.dataset[index].wxlink;
          wxltype = this.properties.showCaseList.content.dataset[index]
            .wxlinkType;
          if (wxltype == 1) {
            wx.switchTab({
              url: "/" + link,
            });
          } else {
            wx.navigateTo({
              url: "/" + link,
            });
          }
          break;
        case 7:
          link = this.properties.showCaseList.content.dataset[index].wxlink;
          wxltype = this.properties.showCaseList.content.dataset[index]
            .wxlinkType;
          if (wxltype == 1) {
            wx.switchTab({
              url: "/" + link,
            });
          } else {
            wx.navigateTo({
              url: "/" + link,
            });
          }
          break;
        case 8:
          link = this.properties.showCaseList.content.dataset[index].wxlink;
          wxltype = this.properties.showCaseList.content.dataset[index]
            .wxlinkType;
          if (wxltype == 1) {
            wx.switchTab({
              url: "/" + link,
            });
          } else {
            wx.navigateTo({
              url: "/" + link,
            });
          }
          break;
        case 9:
          link = this.properties.showCaseList.content.dataset[index].wxlink;
          wxltype = this.properties.showCaseList.content.dataset[index]
            .wxlinkType;
          if (wxltype == 1) {
            wx.switchTab({
              url: "/" + link,
            });
          } else {
            wx.navigateTo({
              url: "/" + link,
            });
          }
          break;
        case 10:
          link = this.properties.showCaseList.content.dataset[index].wxlink;
          wxltype = this.properties.showCaseList.content.dataset[index]
            .wxlinkType;
          if (wxltype == 1) {
            wx.switchTab({
              url: "/" + link,
            });
          } else {
            wx.navigateTo({
              url: "/" + link,
            });
          }
          break;
        case 11:
          link = this.properties.showCaseList.content.dataset[index].link;
          if (link) {
            wx.navigateTo({
              url: "/pages/outIndex/outIndex?link=" + link,
            });
          } else {
            wx.switchTab({
              url: "/pages/index/index",
            });
          }
          break;
        case 14:
          id = this.properties.showCaseList.content.dataset[index].item_id;
          wxlink = this.properties.showCaseList.content.dataset[index].wxlink;
          wx.navigateTo({
            url: "/" + wxlink + "?id=" + id,
          });
          break;
        case 16:
          link = this.properties.showCaseList.content.dataset[index].wxlink;
          wxltype = this.properties.showCaseList.content.dataset[index]
            .wxlinkType;
          if (wxltype == 1) {
            wx.switchTab({
              url: "/" + link,
            });
          } else {
            wx.navigateTo({
              url: "/" + link,
            });
          }
          break;
        case 17:
          link = this.properties.showCaseList.content.dataset[index].wxlink;
          wxltype = this.properties.showCaseList.content.dataset[index]
            .wxlinkType;
          if (wxltype == 1) {
            wx.switchTab({
              url: "/" + link,
            });
          } else {
            wx.navigateTo({
              url: "/" + link,
            });
          }
          break;
        case 19:
          link = this.properties.showCaseList.content.dataset[index].wxlink;
          wxltype = this.properties.showCaseList.content.dataset[index]
            .wxlinkType;
          if (wxltype == 1) {
            wx.switchTab({
              url: "/" + link,
            });
          } else {
            wx.navigateTo({
              url: "/" + link,
            });
          }
          break;
        case 23:
          link = this.properties.showCaseList.content.dataset[index].link;
          wx.navigateTo({
            url: "/pages/joinNest/joinNest?parameter=" + link,
          });
          break;
        case 24:
          link = this.properties.showCaseList.content.dataset[index].wxlink;
          wxltype = this.properties.showCaseList.content.dataset[index]
            .wxlinkType;
          if (wxltype == 1) {
            wx.switchTab({
              url: "/" + link,
            });
          } else {
            wx.navigateTo({
              url: "/" + link,
            });
          }
          break;
      }
    },
  },
});

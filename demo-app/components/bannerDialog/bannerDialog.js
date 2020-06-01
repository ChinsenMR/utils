// components/addrPicker/addrPicker.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    noticeData: {
      type: Object,
      value: {}
    },
    show: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    province: [{ name: '请选择', id: 0 }], // 省
    city: [{ name: '请选择', id: 0 }],   // 市
    area: [{ name: '请选择', id: 0 }],    // 区
    value: ''   // 选中地址
  },
  address: null,  // 发送给父级的address
  /**
   * 组件的方法列表
   */
  methods: {
    gotoLiveRoom(e) {
      // console.log(e)
      const { id } = e.currentTarget.dataset;
      let customParams = { path: 'pages/index/index', pid: 1 }
      wx.navigateTo({
        url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${id}&custom_params=${encodeURIComponent(JSON.stringify(customParams))}`
      })
    },
    // 关闭 弹窗 
    closeWindow() {
      // console.log(656666)
      // this.data.show = false;
      // this.setData({show: false})
      this.triggerEvent('closeWindow', false)
    }
  }
})

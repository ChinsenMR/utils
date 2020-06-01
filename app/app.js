import tools from './utils/index';

App({
    globalData: {
        scene: '',
        /* 场景值 */

    },
    onLaunch(e) {
        /* 获取设备信息 */
        wx.getSystemInfo({
            success: res => {
                let {
                    height,
                    width,
                    statusBar,
                    customBar,
                    custom
                } = this.globalData;


            }
        })
    },
    onLoad(options) {
        tools.init(this)
    },
    onShow(options) {

    },
    onHide() {}
})
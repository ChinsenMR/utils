utils / Chinsen
使用方法：

1 引入Chinsen/index.js
  import tools from "./utils/Chinsen/index";

2 初始化index里的方法
  onload(){
    tools.init(this); 
  }

3 此时你就能调用以下工具库 
  1 app.alert
    app.alert.loading()
    app.alert.closeLoading()
    app.alert.confirm()
    app.alert.success()
    app.alert.error()
  2 app.tools
    app.tools.setTitle('首页')
    app.tools.cache.get | set | del
    app.tools.setWatcher();
    ......
  3 app.verify
    // 验证顺序为倒序
    const verify = [app.verify.name('Chinsen'), app.verify.idCard('44546546546546')];
    // 用这个判断就能直接拦截所有错误判断
    if(verify.includes(false)){
        return 
    }
    ......
  4 wx.$api
    const app = getApp();
    const formData = {};
    // getUserInfo定义在 utils/Chinsen/requestApi.js
    app.$api.getUserInfo(formData).then(res => { console.log(res) })
  5 wx.$request 
    const formData = {url,methods,hideLoading...... };
    wx.$request(formData).then(res => { console.log(res) })
4 initPage
  <example.js> 
    const app = getApp();

    Page(
    app.tools.initPage({
        data: {
       
        ],
        },
        watch: {},
        setAllData() {
          app.tools.setAllData(this, this.data);
        },
        onReady() {},
        onLoad(options) {
        app.tools.setWatcher(this.data, this.watch);
          this.setData({ params: options });
        },
        onShow() {
          wx.$api
              .getShoptemplate({ sessionId: wx.getStorageSync("sessionId") })
              .then((res) => {
              console.log(res);
              });
        },
        onShareAppMessage() {},
        onHide() {},
        onPullDownRefresh() {
        console.log("下拉触底");
        },
        onReachBottom() {
        console.log("下拉触底");
        },
        onPageScroll(e) {},
        /**
        * 自定义方法全部放这里
        */
        methods: {
        async test() {
            return 55;
        },
        /**
        * 输入文本值
        * @param {*} e
        */
        inputText(e) {
            const {
            detail: { value },
            } = e;
            const {
            currentTarget: {
                dataset: { name },
            },
            } = e;
            this.setData({ [`form.${name}`]: value });
        },
        /**
        *提交申请
        *
        */
        submit() {
            this.test().then((res) => {
            console.log(res);
            wx.navigateTo({ url: "./apply" });
            });
        },
        },
    })
    );
    </example.js>
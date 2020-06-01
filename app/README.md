* 项目中对常用的方法 / 组件 / 样式进行了封装

* 首先了解下目录结构

    ----------------
    - app
    - api (ajax请求流程)
    - assets (静态资源)
    - lib (工具性方法库)
    - components (组件)
    - pages 
    - utils (app.js中所有公用方法都在此文件引入)
    - app.js 
    - app.json 
    - app.wxss (所有公用样式在此引用)
    - config.js (存放所有全局使用的配置，例如：全局分享)
    - project.config.json
    ---------------------

【0】 规范与标准
    1 css样式命名 
        > 格式: demo-wrap
        > 🈲使用下划线 尽可能使用css类库中的类,减少行内样式

    2 变量
    
        > 条件变量: let isFalse = false (不以动词开头)
        > 格式: let myMenu = []

    3 方法 (小程序支持ES6语法,推荐使用)
    
        > 功能方法: getData(){} (以动词开头)
        > 参数方法: data => { return data }

    4 组件化 / 模块化

        > 尽量写复用性可读性强的代码
        > 如发现有可重复性的组件,将其封装好并存入相应文件夹,或分享
        > 开发过程中严格针对每个文件夹功能进行存放
        > 新增模块或方法,请写上注释,以便他人维护

【1】 使用ajax请求

    1 在config.js配置当前项目的服务器域名

        --------------------------------------
        api: {
            domain: 'https://nissanxk.aiitec.net/nissan-php'
        },
        ----------------------------------

    2 在api/url.js中的methodsList配置接口路由及参数（注意请为每个接口功能作用写上注释）
    
        --------------------------
        const methodsList = [
            /* 获取Session */
            {
                name: 'getSession',
                type: 'Session',
                url: Base + 'Session',
                methods: 'POST',
                noLoading: false,
            },
        ]
        --------------------------
    
    3 调用方法，在某个page的js中调用
        
        * 请求流程做了封装，所以我们只需要关心传给这个方法的两个参数
        
            1 params 可选参数，传对象，等同于后端query的q对象 
        
            2 callback 成功回调方法，请求如果为error早已在请求流程被拦截下并处理报错，所以我们不需要去处理请求错误的问题

            3 开始调用

                -----------------------------
                app.ajax.getSession({params: xxx}, res => { todo... })    
                -----------------------------

                or

                放开page页面的注释 app.includeRequestList(NAVTIVE_NETHODS);

                这样的话你必须确保自定义方法中没有与methodsList中的方法名重复的function
                
                -----------------------------
                this.getSession({params: xxx}, res => { todo... })    
                -----------------------------

            
            4 请求结果，为了让前端方便接收请求结果，流程将冗余的参数过滤掉，最终更直观看到你想要的结果

【2】 样式 (这里指通过npm run page + npm run build之后的结果)

    1 scss + wxss混用，在scss文件中可以使用wxss特有的单位和变量 rpx / var(--varName)，并且你可以使用scss的所有语法，只是无法引入文件
        
        -----------------------
        scss
            page { 
                .container {
                    width: 100rpx;
                    color: var(--red)
                }
            }
        
        编译结果如下
        
        wxss
            page .container {
                    width: 100rpx;
                    color: var(--red)
            }
        
        -----------------------

    2 类库使用，无需单独引入，所有公用样式已在app.wxss引入（相关文件app/assets/style/common/library.wxss）

        -----------------------------------
        <view class="flex--content-center text-center">
            <view class="flex-col-1"></view>
        </view>
        
        样式如下
        
        .flex-content-center {display: flex!important;align-items: center!important;justify-content: center;} 
        .flex-col-1 {flex: 1}
        .text-center {text-align: center}
        -----------------------------------

    3 所有样式统一写在page目录下的scss文件
【3】 组件 components 文件夹存放各种组件
    
    1 分系列存放，该目录下只出现三个文件夹

        > common存放封装好的组件
        > custom存放当前项目需使用的组件
        > extpand存放引入的组件 

    2 colorUI是可以直接用，不需要引入，只需要写入html代码和相应js即可，后期如果习惯了它的类名写法，也不失为一套好的公用类库

【4】 公用模块

    1 app.js引入了各种常用的方法,开发中可以直接使用
    
        - ajax: Ajax, // 请求方法
        - config: Config, // 根目录配置文件
        - alert: Alert, // 各种弹窗方法封装
        - tools: Tools, // 工具类
        - expand: Expand, // 小程序拓展（含与$vue.watch类似方法）,
    
    2 config.js中存放了

    



    

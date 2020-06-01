/**
 * Author: Chinsen
 * Date: 2020.05.22
 */
import Alert from "./alert";
import Config from "../config";

export default {
  /* 修改小程序标题 */
  setTitle(title) {
    wx.setNavigationBarTitle({ title });
  },
  /* 同步缓存处理 */
  storage: {
    //获取本地缓存
    get(key, cb) {
      wx.getStorage({
        key,
        success: (res) => {
          cb(res);
        },
      });
    },
    //设置本地缓存
    set(key, data, cb) {
      wx.setStorage({
        key,
        data,
        success: (res) => {
          cb(res);
        },
      });
    },
    //清除本地缓存
    del(key, cb) {
      wx.removeStorage({
        key,
        success: (res) => {
          cb(res);
        },
      });
    },
  },
  /* 用于请求结束后的操作 */
  goPage(params, time = 0) {
    let timeout = setTimeout(() => {
      wx.navigateTo({
        ...params,
        complete: () => {
          clearTimeout(timeout);
        },
      });
    }, Number(time));
  },
  /* 用于请求结束后的操作 */
  goBack(page = 1, time = 0) {
    let timeout = setTimeout(() => {
      wx.navigateBack({
        delta: page,
        complete: () => {
          clearTimeout(timeout);
        },
      });
    }, Number(time));
  },
  /* 获取当前格式化猴日期 */
  getDate(currentDate) {
    const date = currentDate || new Date();

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    let _ = "-";

    if (month >= 1 && month <= 9) month = "0" + month;

    if (strDate >= 0 && strDate <= 9) strDate = "0" + strDate;

    const currentdate = year + _ + month + _ + strDate;

    return currentdate;
  },
  /* 设置所有数据,包括本页面和view视图的数据 */
  setAllData(that, data) {
    for (let i in data) {
      that.data[i] = data[i];
    }
    that.setData(data);
  },

  /* 查看图片 */
  previewImage(current, urls) {
    /* 如果传入的是索引值 */
    if (typeof current == "number") {
      current = urls[current];
    }

    wx.previewImage({ current, urls });
  },

  /* 计算数量,超过一万缩略显示 */
  tranNumber(num) {
    let _num = Number(num);
    if (_num < 10000) {
      return _num;
    } else {
      return (_num / 10000).toFixed(2);
    }
  },

  /* 获取位置信息*/
  async getLocation() {
    wx.getSetting({
      success: (res) => {
        if (
          res.authSetting["scope.userLocation"] != undefined &&
          res.authSetting["scope.userLocation"] != true
        ) {
          wx.showModal({
            title: "请求授权当前位置",
            content: "需要获取您的地理位置，请确认授权",
            success: function (res) {
              if (res.cancel) {
                Alert.error("您拒绝了地理位置授权");
              } else if (res.confirm) {
                wx.openSetting({
                  success(dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      Alert.success("授权成功");
                      //再次授权，调用wx.getLocation的API
                    } else {
                      Alert.error("授权失败");
                    }
                  },
                });
              }
            },
          });
        } else if (res.authSetting["scope.userLocation"] == undefined) {
          //调用wx.getLocation的API
        } else {
          //调用wx.getLocation的API
          wx.getLocation({
            type: "wgs84",
            success(res) {
              const { latitude, longitude, speed, accuracy } = res;
              return {
                latitude,
                longitude,
                speed,
                accuracy,
              };
            },
          });
        }
      },
    });
  },

  /**
   * 文件上传 （支持多文件，多类型）
   * @param {*} options
   * @returns
   * 调用方式
   *  app.tools.upload({
      type: "image",
      url: "/AppShop/AppShopHandler.ashx?action=AppUploadImage",
    }).then(res => {
      console.log(res)
    })
   */
  async upload(options) {
    const {
      url,
      name = "file",
      count = 1,
      formData = {},
      type = "image",
      header = {
        "content-type": "multipart/form-data",
      },
    } = options;

    /* 参数校验 */
    const checkUploadQuery = () => {
      /* 参数检测 */
      if (!url && typeof type !== "string" && url[0] != "/") {
        return Alert.message("URL不能为空", "错误");
      }

      if (
        typeof type !== "string" ||
        !["all", "video", "image", "file"].includes(type)
      ) {
        return Alert.message("TYPE值错误", "错误");
      }
    };

    /* 根据传入type选择上传文件类型 */
    const chooseFile = () => {
      return new Promise((resolve, reject) => {
        console.log(type);
        wx.chooseMessageFile({
          type,
          count,
          success(file) {
            const targetFiles = file.tempFiles;
            const pathList = [];

            targetFiles.map((t) => {
              pathList.push(t.path);
            });

            const outPut = {
              pathList,
              targetFiles,
            };

            resolve(outPut);
          },
        });
      });
    };

    /* 上传文件到服务器 */
    const uploadToServer = (target) => {
      const { targetFiles } = target;
      const outPutResult = [];

      return new Promise((resolve, reject) => {
        const params = {
          header,
          name,
          formData,
          url: Config.url + url,
          complete(response) {
            Alert.closeLoading();

            /* 微信服务端返回包装结果 */
            if (response.errMsg == "uploadFile:ok") {
              /* 纯服务器返回结果 ----------------排查服务端错误请看这里------------*/
              if (response.data) {
                const res = JSON.parse(response.data);
                /* 上传失败 */
                if (res.Status == "fail") {
                  Alert.error(res.errorMsg, 3000);
                  reject(res);
                }

                /* 上传成功，处理结果*/
                outPutResult.push(res.data);

                /* 返回结果 */
                resolve({
                  files: outPutResult,
                  beforeUploadFiles: targetFiles,
                });

                Alert.success("上传成功");
              } else {
                Alert.message("文件上传失败", "错误");
                reject(response);
              }
            }
            if (response.statusCode != 200) {
              Alert.message("文件上传失败，请检查文件上传环境", "错误");
              reject(response);
            }
          },
        };

        targetFiles.map((fileItem, fileIndex) => {
          const uploadTask = wx.uploadFile({
            ...params,
            filePath: fileItem.path,
          });

          uploadTask.onProgressUpdate((res) => {
            const loadText =
              targetFiles.length > 1
                ? `第${fileIndex + 1}个文件上传中...${res.progress}%`
                : "上传中..." + res.progress + "%";

            Alert.loading(loadText);
          });
        });
      });
    };

    /* 上传前检验参数 */
    checkUploadQuery();

    /* 执行选择文件并上传到服务器，拿取结果 */
    const uploadResult = await chooseFile().then((res) => {
      return uploadToServer(res);
    });

    /* 最终输出，通过then拿到最终数据 返回结果数组和上传前的数组，方便看图片信息 { file, targetFiles} */
    return uploadResult;
  },

  // 其中只有在传递 1020、1035、1036、1037、1038、1043 这几个场景值时，才会返回referrerInfo.appId
  /**
   * 用户拒绝授权操作
   * @param {数值} scope
   * @param {回调方法} callback
   */
  scopeAuth(params) {
    let scopeType = params.scope;
    let errorMessage = "";

    switch (Number(scopeType)) {
      case 1:
        scopeType = "scope.writePhotosAlbum";
        errorMessage =
          "拒绝授权将无法保存海报到本地，请前往设置，开启“保存到相册”。";
        break;
    }

    wx.getSetting({
      success(res) {
        if (!res.authSetting[scopeType]) {
          wx.authorize({
            scope: scopeType,
            success() {
              //这里是用户同意授权后的回调
              return true;
            },
            fail() {
              //这里是用户拒绝授权后的回调
              Alert.model(
                {
                  content: errorMessage,
                },
                (confirm) => {
                  wx.openSetting({
                    success: (res) => {
                      if (res.authSetting[scopeType]) {
                        ////如果用户重新同意了授权登录
                        wx.authorize({
                          scope: scopeType,
                          success() {
                            //这里是用户同意授权后的回调
                            return true;
                          },
                        });
                      }
                    },
                  });
                }
              );
            },
          });
        } else {
          //用户已经授权过了
          return true;
        }
      },
    });
  },
  /**
   * 
  data : {
    pageIndex: 0,
    list: [],
    loadMore: true,
    limit: 8,
  };
  
	onPullDownRefresh() {
		this.getList(1);
	},
	onReachBottom() {
		this.getList();
	},
   * @param {*} init
   * @returns
   */

  getList(init) {
    let { pageIndex = 0, list = [], loadMore = true, limit = 8 } = this.data;

    if (init) {
      list = [];
      pageIndex = 0;
      loadMore = true;

      this.setData({ pageIndex, list, loadMore });
    }

    if (!loadMore) return;

    pageIndex++;

    const formData = { pageIndex, limit };

    this.setData({ loadMore: true });

    wx.$api.getList(formData).then((res) => {
      const { TotalCount = 1, resultData = [] } = res.data;

      const maxPageIndex = Math.ceil(TotalCount / rows);

      loadMore = Boolean(pageIndex >= maxPageIndex);

      list = list.concat(resultData);

      wx.stopPullDownRefresh();

      this.setData({ pageIndex, list, loadMore });
    });
  },
  /**
   * start
   * 用于监听，在pages/js文件onload使用
   * @param {接收index.js传过来的data对象} data
   * @param {接收index.js传过来的watch对象} watch
   */
  setWatcher(data, watch) {
    // 和watch对象
    Object.keys(watch).forEach((v) => {
      // 将watch对象内的key遍历
      this.observe(data, v, watch[v]); // 监听data内的v属性，传入watch内对应函数以调用
    });
  },

  observe(obj, key, watchFun) {
    var val = obj[key]; // 给该属性设默认值
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        val = value;
        watchFun(value, val); // 赋值(set)时，调用对应函数
      },
      get: function () {
        return val;
      },
    });
  },
  initPage(page) {
    const methods = page.methods;
    delete page.methods;
    return { ...page, ...methods };
  },
};

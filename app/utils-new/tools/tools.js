/**
 * Author: Chinsen
 * Desc: 工具库
 */
import Alert from './alert'
import Config from '../config'
export default {
  /* 用于请求结束后的操作 */
  goPageTimeOut(params = {}, time = 2000) {
    const timeout = setTimeout(() => {
      wx.navigateTo({
        ...params,
        complete: () => {
          clearTimeout(timeout);
        },
      });
    }, Number(time));
  },

  /* 用于请求结束后的操作 */
  goBackTimeOut(delta = 1, time = 2000) {
    const timeout = setTimeout(() => {
      wx.navigateBack({
        delta,
        complete: () => {
          clearTimeout(timeout);
        }
      });
    }, Number(time));
  },

  /* 获取当前格式化猴日期 */
  getDate(targetDate = new Date()) {
    const date = targetDate;

    let [year, month, strDate, line] = [date.getFullYear(), date.getMonth() + 1, date.getDate(), "-"]

    month = month >= 1 && month <= 9 ? "0" + month : month;

    strDate = strDate >= 0 && strDate <= 9 ? "0" + strDate : strDate;

    const currentDate = year + line + month + line + strDate;

    return currentDate;
  },

  /* 设置所有数据,包括本页面和view视图的数据 */
  setAllData(that, data) {
    for (let i in data) {
      that.data[i] = data[i];
    }

    that.setData(data);
  },

  /* 计算数量,超过一万缩略显示 */
  tranNumber(num = 0) {
    let targetNumber = Number(num);

    if (targetNumber < 10000) {
      return targetNumber.toFixed(2);
    } else {
      return (targetNumber / 10000).toFixed(2) + 'w';
    }
  },

  /* 获取位置信息*/
  getLocation() {

    wx.getSetting({
      success: (res) => {

        const isNeedAuth = res.authSetting["scope.userLocation"] != undefined &&
          res.authSetting["scope.userLocation"] != true;

        if (isNeedAuth) {
          Alert.confirm({
            title: "请求授权当前位置",
            content: "需要获取您的地理位置，请确认授权",
          }, (result) => {

            /* 拒绝授权 */
            if (!result) {
              Alert.message("您拒绝了地理位置授权");
              return
            }

            /* 正常授权 */
            wx.openSetting({
              success(authData) {
                if (authData.authSetting["scope.userLocation"] == true) {
                  Alert.message("授权成功");
                  /* 再次授权，调用wx.getLocation的API */
                } else {
                  Alert.message("授权失败");
                }
              },
            });
          })

        } else if (res.authSetting["scope.userLocation"] == undefined) {
          /* 调用wx.getLocation的API wx.getLocation()*/
        } else {

          //调用wx.getLocation的API
          wx.getLocation({
            type: "wgs84",
            success(res) {

              const {
                latitude,
                longitude,
                speed,
                accuracy
              } = res;

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

  /*上传文件 */
  async upload(options) {
    const app = getApp();
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
    const checkArguments = () => {
      /* 参数检测 */
      if (!url && typeof type !== "string" && url[0] != "/") {
        return app.alert.message("URL不能为空", "错误");
      }

      if (
        typeof type !== "string" ||
        !["all", "video", "image", "file"].includes(type)
      ) {
        return app.alert.message("TYPE值错误", "错误");
      }
    };

    /* 根据传入type选择上传文件类型 */
    const chooseFile = () => {
      return new Promise((resolve, reject) => {

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
      const {
        targetFiles
      } = target;
      const outPutResult = [];

      const uploaders = targetFiles.map(file => {
        return new Promise((resolve, reject) => {
          const params = {
            header,
            name,
            formData,
            url: Config.url + url,
            complete(response) {
              app.alert.closeLoading();

              /* 微信服务端返回包装结果 */
              if (response.errMsg == "uploadFile:ok") {

                /* 纯服务器返回结果 ----------------排查服务端错误请看这里------------*/
                if (response.data) {
                  const res = JSON.parse(response.data);
                  /* 上传失败 */
                  if (res.Status == "fail") {
                    app.alert.error(res.errorMsg, 3000);
                    reject(res);
                  }

                  /* 上传成功，处理结果*/
                  outPutResult.push(res.data);

                  /* 返回结果 */
                  resolve({
                    files: outPutResult,
                    beforeUploadFiles: targetFiles,
                  });

                  app.alert.success("上传成功");
                } else {
                  app.alert.message("文件上传失败", "错误");
                  reject(response);
                }
              }
              if (response.statusCode != 200) {
                app.alert.message("文件上传失败，请检查文件上传环境", "错误");

                reject(response);
              }
            },
          };

          targetFiles.forEach((fileItem, fileIndex) => {
            const uploadTask = wx.uploadFile({
              ...params,
              filePath: fileItem.path,
            });

            uploadTask.onProgressUpdate((res) => {
              const loadText =
                targetFiles.length > 1 ?
                `第${fileIndex + 1}个文件上传中...${res.progress}%` :
                "上传中..." + res.progress + "%";

              app.alert.loading(loadText);
            });
          });
        });
      })

      return Promise.all(uploaders);
    };

    /* 上传前检验参数 */
    checkArguments();

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
    let errorMessage;

    switch (Number(scopeType)) {
      case 1:
        scopeType = "scope.writePhotosAlbum";
        errorMessage =
          "拒绝授权将无法保存海报到本地，请前往设置，开启“保存到相册”。";
        break;
    }

    /* 用户拒绝授权后的回调 */
    const executeFailHandle = () => {

      Alert.model({
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
    }

    /* 用户授权成功后的回调 */
    const executeSuccessHandle = (res) => {
      if (!res.authSetting[scopeType]) {
        wx.authorize({
          scope: scopeType,
          success() {
            /* 这里是用户同意授权后的回调 */
            return true;
          },
          fail() {
            executeFailHandle()
          },
        });
      } else {
        /* 用户已经授权过了 */
        return true;
      }
    }

    wx.getSetting({
      success(res) {
        executeSuccessHandle(res)
      },
      fail() {
        executeFail(res)
      }
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
    let {
      pageIndex = 0, list = [], loadMore = true, limit = 8
    } = this.data;

    if (init) {
      list = [];
      loadMore = true;
      pageIndex = 0;

      this.setData({
        list,
        loadMore,
        pageIndex
      });
    }

    if (!loadMore) return;

    pageIndex++;

    this.setData({
      loadMore: true
    });

    const formData = {
      limit,
      pageIndex,
    };

    wx.$api.getList(formData).then((res) => {
      const {
        totalLimit = 1, resultData = []
      } = res.data;

      const maxPageLength = Math.ceil(totalLimit / rows);

      loadMore = pageIndex >= maxPageLength;

      list = list.concat(resultData);

      wx.stopPullDownRefresh();

      this.setData({
        list,
        loadMore,
        pageIndex,
      });

    });
  },
  /* 长按保存图片 */
  saveImage(target) {
    const isObject = typeof target === 'object';
    const src = isObject ? e.currentTarget.dataset.src : target;

    const save = () => {
      wx.getImageInfo({
        src,
        success: res => {
          wx.saveImageToPhotosAlbum({
            filePath: res.path,
            success(success) {
              console.log(success);
            },
            fail(error) {
              console.log(error);
            }
          })
        }
      })
    }

    const getAuth = () => {
      wx.authorize({
        scope: 'scope.writePhotosAlbum',
        success(res) {
          console.log('用户同意获取权限')
        },
        fail() {
          /* 用户拒绝后回调 */
          Alert.confirm({
            title: "提示",
            content: "请打开权限，否则无法保存",
          }, (confirm) => {
            if (confirm) {
              wx.openSetting({
                success(res) {}
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          })

        }
      })
    }

    /* 获取设置权限，如果没有权限则去获取，否则保存图片 */
    wx.getSetting({
      success(res) {
        !res.authSetting['scope.writePhotosAlbum'] ? getAuth() : save()
      }
    })

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
    let val = obj[key]; // 给该属性设默认值
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: (value) => {
        val = value;
        watchFun(value, val); // 赋值(set)时，调用对应函数
      },
      get: () => {
        return val;
      },
    });
  },


};
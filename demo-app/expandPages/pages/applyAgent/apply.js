// pages/addAddress/addAddress.js

const app = getApp();
const { getTime, getDate } = app.common;

Page(
    app.tools.initPage({
        data: {
            form: {
                wechat: "",
                name: "",
                mobile: "",
                remark: "",
                province: "",
                city: "",
                county: "",
                address: "",
            },
            levelIndex: null,
            levelList: [] /* 代理等级列表 */ ,
            statusCode: null,
            statusText: "",
            params: {},
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
            /* 有id则查看申请详情 */
            if (this.data.params.id) {
                this.getApplyAgencyResult();
            } else {
                this.getAgencyLevel();
            }
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
            /* 输入文本值 */
            inputText(e) {
                const {
                    detail: { value },
                } = e;
                const {
                    currentTarget: {
                        dataset: { name },
                    },
                } = e;

                this.setData({
                    [`form.${name}`]: value,
                });
            },
            /* picker选择回调 */
            selectPicker(e) {
                const {
                    detail: { value },
                    currentTarget: {
                        dataset: { type },
                    },
                } = e;

                let { form } = this.data;

                if (type == "region") {
                    const _form = {
                        province: value[0],
                        city: value[1],
                        county: value[2],
                    };

                    this.setData({ form: {...form, ..._form } });
                } else if (type == "level") {
                    this.setData({ levelIndex: Number(value) });
                }
            },

            /* 获取代理申请结果 */
            getApplyAgencyResult() {
                const formData = {
                    ApplyId: this.data.params.id,
                };

                /* 先获取代理列表 */
                const func = async() => {
                    await this.getAgencyLevel(true);
                    return;
                };

                func().then((data) => {
                    wx.$api.getApplyAgencyResult(formData).then((res) => {
                        if (res.errCode == 0) {
                            console.log(res);
                            const {
                                AuditCode,
                                AuditCodeDes,
                                Phone,
                                Remark,
                                UserName,
                                WxId,
                                BrandLevle,
                                Province,
                                City,
                                County,
                                Address,
                                IdCardNo,
                            } = res.resultData;

                            let {
                                form,
                                statusCode,
                                statusText,
                                levelList,
                                levelIndex,
                            } = this.data;

                            const index = levelList.findIndex((d) => {
                                d.KjGradeId == BrandLevle;
                            });

                            form = {
                                mobile: Phone,
                                remark: Remark,
                                name: UserName,
                                wechat: WxId,
                                province: Province,
                                city: City,
                                county: County,
                                address: Address,
                                idCard: IdCardNo,
                            };

                            levelIndex = index;
                            statusCode = AuditCode;
                            statusText = AuditCodeDes;

                            this.setData({
                                form,
                                statusText,
                                statusCode,
                            });
                        }
                    });
                });
            },
            /* 获取代理等级 */
            getAgencyLevel() {
                wx.$api.getAgencyLevel().then((res) => {
                    if (res.errCode == 0) {
                        this.setData({
                            levelList: res.resultData,
                        });
                    }
                });
            },
            /* 提交申请 */
            submit() {
                const {
                    form: {
                        name,
                        mobile,
                        wechat,
                        idCard,
                        county,
                        province,
                        city,
                        address,
                    },
                    levelList,
                    levelIndex,
                } = this.data;

                const verify = [
                    app.verify.item({ text: levelIndex, error: "请选择代理等级" }),
                    app.verify.item({ text: address, error: "请填写详细地址" }),
                    app.verify.item({ text: county, error: "请选择地区" }),
                    app.verify.idCard(idCard),
                    app.verify.mobile(mobile),
                    app.verify.name(name),
                    app.verify.item({ text: wechat, error: "请输入微信号" }),
                ];

                if (verify.includes(false)) {
                    return;
                }

                const formData = {
                    Wx_Id: wechat,
                    UserName: name,
                    Phone: mobile,
                    Province: province,
                    City: city,
                    County: county,
                    Address: address,
                    BrandLevle: levelList[levelIndex].KjGradeId,
                    IdCardNo: idCard,
                };

                app.alert.confirm({ title: "提示", content: "请确认申请信息" },
                    (confirm) => {
                        if (confirm) {
                            wx.$api.applyAgency(formData).then((res) => {
                                if (res.errCode == 0) {
                                    app.alert.success(res.errMsg, 2000);
                                    app.tools.goPage({ url: "./result" }, 2000);
                                }
                            });
                        }
                    }
                );
            },
            /* 测试方法 */
            upload() {
                app.tools
                    .upload({
                        count: 4,
                        type: "all",
                        url: "/Api/VshopProcess.ashx?action=UpLoadHead",
                        formData: {
                            Type: 1, // 1个人资料,2店铺
                            sessionId: wx.getStorageSync("sessionId"),
                        },
                    })
                    .then((res) => {
                        console.log(res);
                    });
            },
        },
    })
);
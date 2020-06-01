export default {
  // 验证姓名
  name(text) {
    const rgxName = /^[\u4E00-\u9FA5A-Za-z]{2,8}$/;
    const verify = rgxName.test(text);
    if (!verify) {
      wx.showToast({
        title: "请输入2-8位中文或英文名字",
        icon: "none",
      });
    }

    return verify;
  },
  // 校验身份证号
  idCard(text) {
    let rgxIdCard = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/;
    const verify = rgxIdCard.test(text);
    if (!rgxIdCard.test(text)) {
      wx.showToast({
        title: "请填写正确身份证",
        icon: "none",
      });
    }

    return verify;
  },
  // 校验身份证号
  bankCardId(text) {
    let rgx = /\d{15}|\d{19}/
    // /^([1-9]{1})(\d{14}|\d{18})$/;
    
    const verify = rgx.test(text);
    if (!rgx.test(text)) {
      wx.showToast({
        title: "请输入正确的银行卡号",
        icon: "none",
      });
    }

    return verify;
  },
  // 校验手机号
  mobile(text) {
    const verify = /^1[3456789]\d{9}$/.test(text);
    if (!verify) {
      wx.showToast({
        title: "请填写正确手机号",
        icon: "none",
      });
    }

    return verify;
  },
  // 校验是否为空
  item({ text = "", error = "" }) {
    const verify = text !== "" && ![null,undefined,NaN].includes(text);
    if (!verify) {
      wx.showToast({
        title: error || "您的输入有误",
        icon: "none",
      });
    }

    return verify;
  },
};

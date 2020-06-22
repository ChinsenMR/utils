export default {
  /* 验证姓名 */
  name(text) {
    const rgxName = /^[\u4E00-\u9FA5A-Za-z]{2,8}$/;
    const result = {
      error: () => wx.showToast({
        title: "请输入2-8位中文或英文名字",
        icon: "none",
      }),
      verify: rgxName.test(text)
    }

    return result;
  },
  /* 校验身份证号 */
  idCard(text) {
    let rgxIdCard = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/;
    const result = {
      error: () => wx.showToast({
        title: "请填写正确身份证",
        icon: "none",
      }),
      verify: rgxIdCard.test(text)
    }

    return result;
  },
  /* 校验银行卡号 */
  bankCardId(text) {
    let rgx = /\d{15}|\d{19}/;
    const result = {
      error: () => wx.showToast({
        title: "请输入正确的银行卡号",
        icon: "none",
      }),
      verify: rgx.test(text)
    }

    return result;
  },
  /* 校验手机号 */
  mobile(text) {
    const result = {
      error: () => wx.showToast({
        title: "请填写正确手机号",
        icon: "none",
      }),
      verify: /^1[3456789]\d{9}$/.test(text)
    }

    return result;
  },
  /* 校验是否为空 */
  field(text) {
    const verify = text !== "" && ![null, undefined, NaN].includes(text);

    const result = {
      error: () => wx.showToast({
        title: "您的输入有误",
        icon: "none",
      }),
      verify
    }

    return result;
  },
};
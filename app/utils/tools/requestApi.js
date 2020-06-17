import methods from "./request.js";

module.exports = {
  /* 获取申请代理记录列表 */
  getAgencyList(data) {
    return methods
      .request({
        url: "/WebApi/KjApi/KjMemberAuditList",
        data,
        method: "POST"
      })
      .then((res) => res);
  },

  /* 申请代理 */
  applyAgency(data) {
    return methods
      .request({
        url: "/WebApi/KjApi/KjMemberApply",
        data,
        method: "POST"
      })
      .then((res) => res);
  },

  /* 查看申请结果 */
  getApplyAgencyResult(data) {
    return methods
      .request({
        url: "/WebApi/KjApi/KjMemberAuditDetails",
        data,
        method: "POST",
      })
      .then((res) => res);
  },

  /* 获取代理等级 */
  getAgencyLevel(data) {
    return methods
      .request({
        url: "/WebApi/KjApi/GetDistributorGrade",
        data,
        method: "POST",
      })
      .then((res) => res);
  },

  /* 获取购物车数据 */
  getCart(data) {
    return methods
      .request({
        url: "/Api/VshopProcess.ashx?action=GetListShoppingCart",
        data,
        method: "GET",
      })
      .then((res) => res);
  },

  /* 获取用户数据 */
  getUserInfo(data) {
    return methods
      .request({
        url: "/Api/VshopProcess.ashx?action=GetUserInfoBySessionId",
        data,
        method: "GET",
      })
      .then((res) => res);
  },
  getGoodsList(data) {
    return methods
      .request({
        url: "/goodsList",
        data,
        method: "GET",
      })
      .then((res) => res);
  },
};
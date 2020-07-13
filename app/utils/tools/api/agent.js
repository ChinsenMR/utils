import $api from "../request.js";
export default{
      /**
     * 绑定代理 
     * **/
    bindAgent(data) {
        return $api.request({
            url: '/API/VshopProcess.ashx?action=BindAgent',
            data,
            hideToast: true,
        }).then(res => res)
    },
     /* 绑定上下级关系 */
     bindReferralUserId(data) {
        return $api.request({
            url: '/API/Request/BindReferralUserId',
            data,
            type: "POST",
        }).then((res) => res)
    },
    /* 获取代理配置 */
    getApplectWebSet(data){
        return $api.request({
            url: '/api/publicHandler.ashx?action=GetApplectWebSet',
            data,
            hideToast: true,
        }).then((res) => res)
    }
}
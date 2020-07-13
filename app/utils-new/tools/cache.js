export default {
    /* 拿 / 存 / 删 */
    get(key, success) {
        wx.getStorage({
            key,
            success: res => {
                success(res)
            }
        });
    },
    set(key, data, success) {
        wx.setStorage({
            key,
            data,
            success: res => {
                success(res)
            }
        });
    },
    remove(key, success) {
        wx.removeStorage({
            key,
            success: res => {
                success(res)
            }
        });
    },

    _sessionId() {
        return this.get('_sessionId_', res => res)
    },
    _token() {
        return this.get('_token_', res => res)
    },
    _userInfo() {
        return this.get('_userInfo_', res => res)
    }
}
module.exports = {
    /* 阻止连续点击 */
    async beMask() {
        let timeout = setTimeout(() => {
            clearTimeout(timeout)
            return true
        }, 1000)
        const res = await timeout;
        return res
    },

    /* ************* 解决方案 **************************** */
    /* 提交在loading出来之前连续点了两次，用此方法解决 */

    /* 阻止连续点击 */
    disableConfirm() {
        this.setData({
            confirmOrderIng: true
        })

        let timeout = setTimeout(() => {
            this.setData({
                confirmOrderIng: false
            }, () => {
                clearTimeout(timeout)
            })
        }, 1000)
    },
}
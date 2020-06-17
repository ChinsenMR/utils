import mixinsList from '../mixins/index';
import middleware from '../mixins/middleware';

module.exports = {
    initPage(page) {
        
        const pageList = getCurrentPages();
        const currentPage = pageList[pageList.length - 1];

        /* 私有变量 */
        const staticVar = {
            _mask: false,
            _loading: false,
            // _route: `/${ currentPage.route }`,
            _pages: () => getCurrentPages(),
        }

        /* 混合器，提供一些常用方法 */
        const mixins = {
            ...mixinsList,
            ...middleware
        }

        /* 定义一些私有变量 */
        page.methods.mixins = mixins;
        page.data.static = staticVar;
        /* 分开所开钩子函数和自定义函数 */
        const methods = page.methods;
        delete page.methods;

        return {
            ...page,
            ...methods
        };
    },
}
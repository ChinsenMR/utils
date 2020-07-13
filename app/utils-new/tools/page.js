import mixinsList from '../mixins/index';
import middleware from '../mixins/middleware';


export default (page) => {

    /* 私有变量 */
    const _static = {
        _mask: false,
        _loading: false,
        _pages: () => getCurrentPages(),
    }

    /* 混合器，提供一些常用方法 */
    const mixins = {
        ...mixinsList,
        ...middleware
    }

    /* 定义一些私有变量 */
    page.methods = Object.assign(page.methods, mixins);
    page.data = Object.assign(page.data, _static)

    /* 分开所开钩子函数和自定义函数 */
    const methods = page.methods;
    delete page.methods;

    return {
        ...page,
        ...methods
    };
}
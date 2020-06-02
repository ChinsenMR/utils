import './utils/store/test';

let store = {
	data: {
		motto: 'Hello World',
		userInfo: {},
		node: '哈哈哈哈哈',
		hasUserInfo: false,
		canIUse: wx.canIUse('button.open-type.getUserInfo'),
		logs: [],
		b: {
			arr: [
				{
					name: '数值项目1',
				},
			],
			//深层节点也支持函数属性
			fnTest: function () {
				return this.motto.split('').reverse().join('');
			},
		},
		test: '这个是在store.js定的',
		firstName: 'dnt',
		lastName: 'zhang',
		fullName: function () {
			return this.firstName + this.lastName;
		},
		pureProp: 'pureProp',
		globalPropTest: 'abc', //更改我会刷新所有页面,不需要在组件和页面声明data依赖
		ccc: {
			ddd: 1,
		}, //更改我会刷新所有页面,不需要在组件和页面声明data依赖
	},
	globalData: ['globalPropTest', 'ccc.ddd'],
	logTest() {
		console.log(this.data.test, '>MM');
	},
	setTest() {
		this.data.test = 8008208820;
	},
	//默认 false，为 true 会无脑更新所有实例
	//updateAll: true
};

export default store;

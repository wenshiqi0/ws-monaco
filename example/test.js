
// 获取应用实例
const app = getApp();

Page({
  data: {
    motto: 'Hello World 4',
    userInfo: {},
  },
  // 事件处理函数
  bindViewTap() {
    abridge.navigateTo({
      url: '../logs/logs',
    })


  },
  onLoad() {
    console.log('onLoad');
    // 调用应用实例的方法获取全局数据
    app.getUserInfo((userInfo) => {
      console.warn(`==== ${JSON.stringify(userInfo)}`);
      // 更新数据
      this.setData({
        userInfo,
      });
    });
  },
});

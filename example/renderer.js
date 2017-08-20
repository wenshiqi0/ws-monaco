const { readFile } = require('fs');
const { join } = require('path');
const container = document.getElementById('editor');

const { GrammarRegistry, getDefaultRegistry, editorOptions, setLintRc } = require('../lib');

let editor;
const language = 'javascript';

// 新的 vscode textmate 语法解析实现
const registry = getDefaultRegistry(join(__dirname, '../lib'));
setLintRc(join(__dirname, './lint.json'));
const body = document.body;

// theme 注册为黑色的 token
GrammarRegistry.setMode('dark');

// 初始内容
const initText = `
{
  "pages": [
    "page/component/index",
    "page/component/component-pages/action-sheet/action-sheet",
    "page/component/component-pages/audio/audio",
    "page/component/component-pages/button/button",
    "page/component/component-pages/canvas/canvas",
    "page/component/component-pages/checkbox/checkbox",
    "page/component/component-pages/form/form",
    "page/component/component-pages/icon/icon",
    "page/component/component-pages/image/image",
    "page/component/component-pages/input/input",
    "page/component/component-pages/label/label",
    "page/component/component-pages/loading/loading",
    "page/component/component-pages/map/map",
    "page/component/component-pages/modal/modal",
    "page/component/component-pages/navigator/navigate",
    "page/component/component-pages/navigator/redirect",
    "page/component/component-pages/navigator/navigator",
    "page/component/component-pages/picker/picker",
    "page/component/component-pages/picker-view/picker-view",
    "page/component/component-pages/progress/progress",
    "page/component/component-pages/radio/radio",
    "page/component/component-pages/scroll-view/scroll-view",
    "page/component/component-pages/slide-tab/slide-tab",
    "page/component/component-pages/slider/slider",
    "page/component/component-pages/swiper/swiper",
    "page/component/component-pages/switch/switch",
    "page/component/component-pages/text/text",
    "page/component/component-pages/textarea/textarea",
    "page/component/component-pages/toast/toast",
    "page/component/component-pages/video/video",
    "page/component/component-pages/view/view",

    "page/API/index/index",
    "page/API/share/share",
    "page/API/action-sheet/action-sheet",
    "page/API/alert/alert",
    "page/API/animation/animation",
    "page/API/canvas/canvas",
    "page/API/choose-city/choose-city",
    "page/API/confirm/confirm",
    "page/API/contact/contact",
    "page/API/date-picker/date-picker",
    "page/API/download-file/download-file",
    "page/API/file/file",
    "page/API/get-auth-code/get-auth-code",
    "page/API/get-location/get-location",
    "page/API/get-network-type/get-network-type",
    "page/API/get-system-info/get-system-info",
    "page/API/get-user-info/get-user-info",
    "page/API/image/image",
    "page/API/loading/loading",
    "page/API/make-phone-call/make-phone-call",
    "page/API/navigation-bar-loading/navigation-bar-loading",
    "page/API/navigator/navigator",
    "page/API/on-accelerometer-change/on-accelerometer-change",
    "page/API/on-compass-change/on-compass-change",
    "page/API/open-location/open-location",
    "page/API/pull-down-refresh/pull-down-refresh",
    "page/API/request/request",
    "page/API/request-payment/request-payment",
    "page/API/scan-code/scan-code",
    "page/API/set-navigation-bar/set-navigation-bar",
    "page/API/storage/storage",
    "page/API/toast/toast",
    "page/API/upload-file/upload-file",
    "page/API/vibrate/vibrate",
    "page/API/video/video",
    "page/API/watch-shake/watch-shake",
    "page/API/clipboard/clipboard",
    "page/API/rsa/rsa"
  ],
  "window": {
    "enableWK":true,
    "defaultTitle": "小程序",
    "backgroundColor": "#fff",
    "pullRefresh": false,
    "allowsBounceVertical": true
  },
  "tabBar": {
    "textColor": "#404040",
    "selectedColor": "#108ee9",
    "backgroundColor": "#ffffff",
    "items": [{
      "pagePath": "page/component/index",
      "icon": "image/icon_component.png",
      "activeIcon": "image/icon_component_HL.png",
      "name": "组件"
    }, {
      "pagePath": "page/API/index/index",
      "icon": "image/icon_API.png",
      "activeIcon": "image/icon_API_HL.png",
      "name": "API"
    }]
  },
  "debug": true
}
`;

const jsText = `
Page({
  pageId: '10320655001',
  data: {
    id: 0,
    sportId: 0,
    detail: {},
    //地图标关
    markers: [],
    polyline: [],
    controls: [],
    currentMarker: {},
    placeInfo: false,

    meLatitude:  30.273923,
    meLongitude: 120.12703,
  },

  loadDetail: function () {
    let _this = this;
    let today = new Date();
    // let date = util.formatDate(today).url;
    let productType = 0;


    var success = {"total":230,"pageSize":20,"current":1,"searchVenueList":[{"venueId":18824,"venueName":"亚力克斯私人健身会馆","available":1,"aliasName":"","source":2,"imgUrl":"https://dimg.fws.qa.nt.ctripcorp.com/images/72050f00000001m9f93B9_R_345_220.png","price":2800,"address":"上海市静安区陕西北路66号2101室(科恩国际中心)","phone":"8539","latitude":31.23073387145996,"longitude":121.46330261230469,"commentMark":5.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":112,"locationName":"静安区","locationEName":"Jing'an District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":20,"sportName":"健身","sportEName":"jianshen"}],"distance":1730.0},{"venueId":12283,"venueName":"武德搏击黄浦馆","available":1,"aliasName":"","source":4,"imgUrl":"https://dimg.fws.qa.nt.ctripcorp.com/images/720u0d00000001gs9607C_R_345_220.jpg","price":114000,"address":"上海市黄浦区西藏南路765号19楼（近方斜路）","phone":"18117575577","latitude":31.221393585205078,"longitude":121.49150848388672,"commentMark":4.5,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":115,"locationName":"黄浦区","locationEName":"Huangpu District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":21,"sportName":"武术","sportEName":"wushu"}],"distance":1984.0},{"venueId":18799,"venueName":"Training Fit健身","available":1,"aliasName":"","source":2,"imgUrl":"https://dimg.fws.qa.nt.ctripcorp.com/images/720t0f00000001m8i00E0_R_345_220.jpg","price":1800,"address":"上海市闸北区恒丰路218号现代交通商务大厦西区810室","phone":"8310","latitude":31.247268676757812,"longitude":121.46310424804688,"commentMark":5.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"sportList":[{"sportId":20,"sportName":"健身","sportEName":"jianshen"}],"distance":2031.0},{"venueId":18819,"venueName":"88桌球棋牌会所","available":1,"aliasName":"","source":2,"imgUrl":"https://dimg.fws.qa.nt.ctripcorp.com/images/720m0f00000001mae4BAB_R_345_220.png","price":4000,"address":"上海市闸北区公兴路88号","phone":"8467","latitude":31.259462356567383,"longitude":121.48102569580078,"commentMark":4.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"sportList":[{"sportId":24,"sportName":"台球","sportEName":"taiqiu"}],"distance":2569.0},{"venueId":23778,"venueName":"瑨会所篮球馆","available":1,"aliasName":"","source":9,"imgUrl":"","price":0,"address":"上海市静安区天通庵路168号B2层","phone":"","latitude":31.258237838745117,"longitude":121.47135925292969,"commentMark":5.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":112,"locationName":"静安区","locationEName":"Jing'an District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":1,"sportName":"羽毛球","sportEName":"yumaoqiu"},{"sportId":3,"sportName":"篮球","sportEName":"lanqiu"}],"distance":2574.0},{"venueId":18816,"venueName":"花园台球（闸北区）","available":1,"aliasName":"","source":2,"imgUrl":"https://dimg.fws.qa.nt.ctripcorp.com/images/72020f00000001mam1C01_R_345_220.png","price":4000,"address":"上海市闸北区天目西路500号3F","phone":"8440","latitude":31.251296997070312,"longitude":121.45785522460938,"commentMark":5.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"sportList":[{"sportId":24,"sportName":"台球","sportEName":"taiqiu"}],"distance":2700.0},{"venueId":18809,"venueName":"南山久久台球城","available":1,"aliasName":"","source":2,"imgUrl":"https://dimg.fws.qa.nt.ctripcorp.com/images/720u0f00000001m342D99_R_345_220.png","price":3000,"address":"上海市静安区南山路79号2层","phone":"8445","latitude":31.262880325317383,"longitude":121.4721450805664,"commentMark":4.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"sportList":[{"sportId":24,"sportName":"台球","sportEName":"taiqiu"}],"distance":3047.0},{"venueId":12254,"venueName":"唤潮健身嘉杰店","available":1,"aliasName":"","source":4,"imgUrl":"","price":10000,"address":"上海市虹口区四川北路1869号嘉杰国际广场3楼","phone":"021-61486378","latitude":31.263914108276367,"longitude":121.48881530761719,"commentMark":4.5,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":116,"locationName":"虹口区","locationEName":"Hongkou District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":19,"sportName":"综合健身","sportEName":"jianshen"}],"distance":3170.0},{"venueId":20664,"venueName":"山夫桌球俱乐部","available":1,"aliasName":"","source":2,"imgUrl":"https://dimg.fws.qa.nt.ctripcorp.com/images/720o0f00000001mix6018_R_345_220.jpg","price":5500,"address":"肇嘉浜路268号紫苑大厦裙楼3楼(近大木桥路)\t","phone":"8503","latitude":31.209636688232422,"longitude":121.46745300292969,"commentMark":4.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":113,"locationName":"徐汇区","locationEName":"Xuhui District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":24,"sportName":"台球","sportEName":"taiqiu"}],"distance":3217.0},{"venueId":26221,"venueName":"天际-世茂滨江足球场","available":1,"aliasName":"","source":9,"imgUrl":"","price":0,"address":"上海市浦东新区潍坊西路世茂滨江花园\t","phone":"","latitude":31.222835540771484,"longitude":121.51277160644531,"commentMark":5.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":119,"locationName":"浦东新区","locationEName":"Pudong New Area","cityID":2,"cityName":"上海"},"sportList":[{"sportId":2,"sportName":"足球","sportEName":"zuqiu"}],"distance":3444.0},{"venueId":24877,"venueName":"华人球府局门路店","available":1,"aliasName":"","source":9,"imgUrl":"","price":0,"address":"上海市黄浦区局门路427号智造局二期1号楼顶","phone":"","latitude":31.20345115661621,"longitude":121.48228454589844,"commentMark":0.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":115,"locationName":"黄浦区","locationEName":"Huangpu District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":2,"sportName":"足球","sportEName":"zuqiu"}],"distance":3672.0},{"venueId":20632,"venueName":"瑜舍连锁瑜伽教室(旗舰店)","available":1,"aliasName":"","source":2,"imgUrl":"https://dimg.fws.qa.nt.ctripcorp.com/images/720e0g00000001nozAEDB_R_345_220.png","price":9800,"address":" 普陀区 长寿路652号上海国际时尚教育中心F座6楼(近胶州路)","phone":"","latitude":31.244653701782227,"longitude":121.4386215209961,"commentMark":4.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":120,"locationName":"普陀区","locationEName":"Putuo District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":31,"sportName":"瑜伽","sportEName":"yujia"}],"distance":4066.0},{"venueId":12273,"venueName":"传奇跆拳道曹家渡总馆","available":1,"aliasName":"","source":4,"imgUrl":"https://dimg.fws.qa.nt.ctripcorp.com/images/720l0d00000001gv6BF90_R_345_220.jpg","price":2500,"address":"上海市普陀区长寿路999弄15号达安花园","phone":"62321186","latitude":31.239194869995117,"longitude":121.4363021850586,"commentMark":4.5,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":120,"locationName":"普陀区","locationEName":"Putuo District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":21,"sportName":"武术","sportEName":"wushu"}],"distance":4193.0},{"venueId":18782,"venueName":"半岛花园游泳馆","available":1,"aliasName":"","source":2,"imgUrl":"https://dimg.fws.qa.nt.ctripcorp.com/images/720n0f00000001m7s732A_R_345_220.png","price":3200,"address":"西康路1518弄14号","phone":"8488","latitude":31.254152297973633,"longitude":121.44100189208984,"commentMark":4.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":120,"locationName":"普陀区","locationEName":"Putuo District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":5,"sportName":"游泳","sportEName":"youyong"}],"distance":4225.0},{"venueId":26545,"venueName":"上海美伽健身俱乐部（澳门路店）","available":1,"aliasName":"","source":9,"imgUrl":"","price":0,"address":"上海市普陀区澳门路733号","phone":"","latitude":31.242435455322266,"longitude":121.43617248535156,"commentMark":3.5,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":120,"locationName":"普陀区","locationEName":"Putuo District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":4,"sportName":"网球","sportEName":"wangqiu"}],"distance":4247.0},{"venueId":18776,"venueName":"锦都桌球俱乐部","available":1,"aliasName":"","source":2,"imgUrl":"https://dimg.fws.qa.nt.ctripcorp.com/images/720h0f00000001m94BA8E_R_345_220.jpg","price":2500,"address":"徐汇区吴兴路277号锦都大厦内(近建国西路) ","phone":"","latitude":31.20619010925293,"longitude":121.45207977294922,"commentMark":3.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":113,"locationName":"徐汇区","locationEName":"Xuhui District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":24,"sportName":"台球","sportEName":"taiqiu"}],"distance":4300.0},{"venueId":25935,"venueName":"滨江体育公园","available":1,"aliasName":"","source":9,"imgUrl":"","price":0,"address":"浦东新区浦明路1888号（南码头滨江文化体育休闲园内) ","phone":"","latitude":31.20587921142578,"longitude":121.51090240478516,"commentMark":5.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":119,"locationName":"浦东新区","locationEName":"Pudong New Area","cityID":2,"cityName":"上海"},"sportList":[{"sportId":2,"sportName":"足球","sportEName":"zuqiu"}],"distance":4478.0},{"venueId":12472,"venueName":"葡萄葡葡萄葡葡萄葡葡萄葡葡萄葡葡萄葡葡萄葡葡萄葡葡萄葡葡萄葡葡萄","available":1,"aliasName":"","source":4,"imgUrl":"","price":1,"address":"上海市杨浦区阿斯利康惦记好久卡上的和控件啊啊606室。","phone":"010-88998899","latitude":31.27631187438965,"longitude":121.4923095703125,"commentMark":4.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":114,"locationName":"长宁区","locationEName":"Changning District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":1,"sportName":"羽毛球","sportEName":"yumaoqiu"},{"sportId":2,"sportName":"足球","sportEName":"zuqiu"},{"sportId":3,"sportName":"篮球","sportEName":"lanqiu"},{"sportId":4,"sportName":"网球","sportEName":"wangqiu"},{"sportId":5,"sportName":"游泳","sportEName":"youyong"},{"sportId":7,"sportName":"乒乓球","sportEName":"pingpang"},{"sportId":10,"sportName":"高尔夫","sportEName":"gaoerfu"},{"sportId":12,"sportName":"保龄球","sportEName":"baolingqiu"},{"sportId":22,"sportName":"棒球","sportEName":"bangqiu"}],"distance":4589.0},{"venueId":12239,"venueName":"唤潮健身华阳店","available":1,"aliasName":"","source":4,"imgUrl":"https://dimg.fws.qa.nt.ctripcorp.com/images/72070d00000001gwi7D49_R_345_220.jpg","price":10000,"address":"上海市长宁区长宁路546号长宁会馆（近华阳路）","phone":"021-62419870","latitude":31.227977752685547,"longitude":121.43112182617188,"commentMark":4.5,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"locationInfo":{"locationID":114,"locationName":"长宁区","locationEName":"Changning District","cityID":2,"cityName":"上海"},"sportList":[{"sportId":5,"sportName":"游泳","sportEName":"youyong"},{"sportId":19,"sportName":"综合健身","sportEName":"jianshen"},{"sportId":23,"sportName":"健美","sportEName":"jianmei"}],"distance":4768.0},{"venueId":26259,"venueName":"聚动力河畔球场","available":1,"aliasName":"","source":9,"imgUrl":"","price":0,"address":"卢湾区鲁班路909号卢浦大桥浦西广场(卢浦大桥浦西广场内)","phone":"","latitude":31.192846298217773,"longitude":121.4791259765625,"commentMark":5.0,"cityInfo":{"cityID":2,"cityName":"上海","cityEName":"shanghai"},"sportList":[{"sportId":2,"sportName":"足球","sportEName":"zuqiu"}],"distance":4848.0}],"ResponseStatus":{"Timestamp":"/Date(1501481678746+0800)/","Ack":"Success","Extension":[{"Id":"CLOGGING_TRACE_ID","Value":"7497206862314521621"},{"Id":"RootMessageId","Value":"921812-0a022627-417078-100464"}]}}


    console.info('=====222222222');
    var detail = success.searchVenueList;
    var _markers  = [];

      detail.map(function (item, i) {
        _markers[i] = {
          id: detail[i].venueId,
          latitude: detail[i].latitude,
          longitude: detail[i].longitude,
          width: 30,
          height: 41,
          title: detail[i].venueName,
          address: detail[i].address,
          phone: detail[i].phone
        };
      })
      _this.setData({
        detail: detail,
        markers: _markers
      })
      console.info('aaaa');

  },
  regionchange(e) {
    console.log("移动地图===" + e.type);
    if (e.type == 'end') {
      this.getLngLat();
    }
  },
  // getLngLat: function () {
  //   var that = this;
  //   that.mapCtx = wx.createMapContext("map");
  //   console.log(this.mapCtx);
  //   that.mapCtx.getCenterLocation({
  //     success: function (res) {
  //       console.log(res.longitude);
  //       console.log(res.latitude);
  //       that.setData({
  //         meLongitude: res.longitude,
  //         meLatitude: res.latitude
  //       })
  //       that.loadDetail();

  //     }
  //   })
  // },
  markertap(e) {
    // console.log(e);
    // this.setData({
    //   placeInfo: true
    // })
    // let _currentMarker = {};
    // this.data.markers.map(function (item, i) {
    //   if (e.markerId == item.id) {
    //     _currentMarker = item;
    //     wx.openLocation({
    //       longitude: _currentMarker.longitude,
    //       latitude: _currentMarker.latitude,
    //       name: _currentMarker.title,
    //       address: _currentMarker.address
    //     })
    //   }
    // })
    // console.log(_currentMarker);
  },
  controltap(e) {
    // console.log('opene', e);
    // console.log('opencontrolId', e.controlId)
    console.info('-aaaaaaaaadfsdfaasdf');
  },

  onLoad: function (query) {
    console.log('query', query);
    let _this = this;
    this.setData({
      cityId: 2
    });
    this.loadDetail()
  },
  onShareAppMessage: function () {
    // return {
    //   title: '携程运动',
    //   desc: '运动场馆预订,球场预订,场地预订,体育馆,羽毛球馆,篮球场,足球场,游泳馆,网球场,高尔夫球场,携程运动',
    //   path: '/pages/detailmap/detailmap?id=' + this.data.id + "&sportid=" + this.data.sportId
    // }
  }
})
`

// monaco 使用的 amd 方式来加载 monaco
const loader = require('ant-monaco-editor/dev/vs/loader');

// 指定 monaco 文件的地址目录，这里需要使用绝对路径
loader.require.config({
  baseUrl: join(__dirname, '../node_modules/ant-monaco-editor/dev'),
})

// 开始加载 monaco
loader.require(['./vs/editor/editor.main'], async function () {
  const globalEditor = window.monaco.editor;

  // 定义编辑器的外观皮肤，目前实现有 dark 和 light
  globalEditor.defineTheme('tiny', {
    base: 'vs-dark',
    inherit: true,
    rules: [], // 之后实际要复写这些rules的，所以干脆就传个空数组进去
    colors: GrammarRegistry.getDefaultColors(),
  });

  // 注册编辑器的皮肤
  globalEditor.setTheme('tiny');

  // monaco 编辑器的 dom 容器
  const container = document.createElement('div');
  container.setAttribute('style', `height: ${window.innerHeight}px; width: ${window.innerWidth}px;`);

  // resize 事件注册
  window.onresize = () => {
    container.setAttribute('style', `height: ${window.innerHeight}px; width: ${window.innerWidth}px;`);
    editor.layout();
  }

  body.appendChild(container);
  handleDragFile(container);

  // 创建第一个编辑器实例
  editor = window.monaco.editor.create(container, Object.assign({}, editorOptions, {
    tabSize: 2,
  }));

  // 设置编辑器为当前上下文
  registry.setCurrentEditor(editor);
  // 启动语法插件
  registry.activateExtensions();

  // monaco 根据 token rules 解析出来的 css rules 和 vscode-textmate 有差异
  // 所以这个地方直接复写掉这一部分的 css 样式，用 vscode-textmate 的解析结果来代替
  registry.reloadTheme('tiny');

  // 异步注册语言，并创建 textModel，将当前 model 装载进 editor 中
  await Promise.resolve({ languageId: language, registry })
    .then((res) => { if (language) return GrammarRegistry.loadGrammar(res); })
    .then((res) => { if (language) return GrammarRegistry.registerLanguage(res); })
    .then(() => {
        const model = window.monaco.editor.createModel(jsText, language, 'ant-monaco://test');
        editor.setModel(model);
    })
});

function handleDragFile(dom) {
  // 文件拖拽
  dom.ondragover = (e) => false
  dom.ondragleave = (e) => false
  dom.ondragend = (e) => false
  dom.ondrop = (e) => {
    e.preventDefault()

    const file = e.dataTransfer.files[0];

    readFile(file.path, 'utf8', (err, text) => {
      const models = window.monaco.editor.getModels();
      if (models[0])
        models[0].setValue(text);
    });
    
    return false;
  }
}
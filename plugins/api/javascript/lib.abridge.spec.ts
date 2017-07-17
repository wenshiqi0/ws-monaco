
interface startBluetoothDevicesDiscoveryParams {
 /** 
  * 蓝牙设备主 service 的 uuid 列表
  */
 services?: Array<string>;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface getBluetoothDevicesParams {
 /** 
  * 蓝牙设备主 service 的 uuid 列表
  */
 services?: Array<string>;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface getConnectedBluetoothDevicesParams {
 /** 
  * 蓝牙设备主 service 的 uuid 列表
  */
 services?: Array<string>;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface connectBLEDeviceParams {
 /** 
  * 蓝牙设备id
  */
 deviceId?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface disconnectBLEDeviceParams {
 /** 
  * 蓝牙设备id
  */
 deviceId?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface writeBLECharacteristicValueParams {
 /** 
  * 蓝牙设备 id，参考 device 对象
  */
 deviceId?: string;

 /** 
  * 蓝牙特征值对应 service 的 uuid
  */
 serviceId?: string;

 /** 
  * 蓝牙特征值的 uuid
  */
 characteristicId?: string;

 /** 
  * notify 的 descriptor 的 uuid （只有android 会用到，非必填，默认值00002902-0000-1000-8000-00805f9b34fb）
  */
 descriptorId?: string;

 /** 
  * 蓝牙设备特征值对应的值，16进制字符串
  */
 value?: hex | string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface readBLECharacteristicValueParams {
 /** 
  * 蓝牙设备 id，参考 device 对象
  */
 deviceId?: string;

 /** 
  * 蓝牙特征值对应 service 的 uuid
  */
 serviceId?: string;

 /** 
  * 蓝牙特征值的 uuid
  */
 characteristicId?: string;

 /** 
  * notify 的 descriptor 的 uuid （只有android 会用到，非必填，默认值00002902-0000-1000-8000-00805f9b34fb）
  */
 descriptorId?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface notifyBLECharacteristicValueChangeParams {
 /** 
  * 蓝牙设备 id，参考 device 对象
  */
 deviceId?: string;

 /** 
  * 蓝牙特征值对应 service 的 uuid
  */
 serviceId?: string;

 /** 
  * 蓝牙特征值的 uuid
  */
 characteristicId?: string;

 /** 
  * notify 的 descriptor 的 uuid （只有android 会用到，非必填，默认值00002902-0000-1000-8000-00805f9b34fb）
  */
 descriptorId?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface getBLEDeviceServicesParams {
 /** 
  * 蓝牙设备 id，参考 device 对象
  */
 deviceId?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface getBLEDeviceCharacteristicsParams {
 /** 
  * 蓝牙设备 id，参考 device 对象
  */
 deviceId?: string;

 /** 
  * 蓝牙设备服务的 uuid
  */
 serviceId?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface setClipboardParams {
 /** 
  * 剪贴板数据
  */
 text?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface scanParams {
 /** 
  * 扫描目标类型，支持 qr / bar，相应扫码选框会不同，默认 qr
  */
 type?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface makePhoneCallParams {
 /** 
  * 电话号码
  */
 number?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface getLocationParams {
 /** 
  * 钱包经纬度定位缓存过期时间，单位秒。默认 30s。使用缓存会加快定位速度，缓存过期会重新定位
  */
 cacheTimeout?: number;

 /** 
  * 定位超时失败回调时间，单位秒。默认10s
  */
 timeout?: number;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface openLocationParams {
 /** 
  * 经度
  */
 longitude?: string;

 /** 
  * 纬度
  */
 latitude?: string;

 /** 
  * 位置名称
  */
 name?: string;

 /** 
  * 地址的详细说明
  */
 address?: string;

 /** 
  * 缩放比例，范围 3~19，默认为 15
  */
 scale?: number;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface playBackgroundAudioParams {
 /** 
  * 音乐链接地址
  */
 url?: string;

 /** 
  * 音乐标题
  */
 title?: string;

 /** 
  * 演唱者
  */
 singer?: string;

 /** 
  * 音乐描述
  */
 describe?: string;

 /** 
  * logo URL
  */
 logo?: string;

 /** 
  * 封面 URL
  */
 cover?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface seekBackgroundAudioParams {
 /** 
  * 音乐位置，单位秒
  */
 position?: number;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface chooseVideoParams {
 /** 
  * 最大录制时长，单位秒，默认60s
  */
 maxDuration?: number;

 /** 
  * 相册选取或者拍照，默认 
  */
 sourceType?: string | Array<string>;

 /** 
  * 前置或者后置摄像头，默认前后都有，即：
  */
 camera?: string | Array<string>;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface uploadFileParams {
 /** 
  * 开发者服务器地址
  */
 url?: string;

 /** 
  * 要上传文件资源的本地定位符
  */
 filePath?: string;

 /** 
  * 文件名，即对应的 key, 开发者在服务器端通过这个 key 可以获取到文件二进制内容
  */
 fileName?: string;

 /** 
  * 文件类型，image/video
  */
 fileType?: string;

 /** 
  * HTTP 请求 Header
  */
 headers?: Object;

 /** 
  * HTTP 请求中其他额外的 form 数据
  */
 formData?: Object;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface downloadFileParams {
 /** 
  * 下载文件地址
  */
 url: string;

 /** 
  * HTTP 请求 Header
  */
 headers: Object;

}
interface chooseImageParams {
 /** 
  * 最大可选照片数，默认1张，上限9张
  */
 count?: number;

 /** 
  * 相册选取或者拍照，默认 
  */
 sourceType?: string[];

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface previewImageParams {
 /** 
  * 要预览的图片链接列表
  */
 urls?: Array<string>;

 /** 
  * 当前显示图片索引，默认 0
  */
 current?: number;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface saveImageParams {
 /** 
  * 要保存的图片链接
  */
 url?: string;

 /** 
  * 是否显示图片操作菜单，默认 true
  */
 showActionSheet?: boolean;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface startRecordParams {
 /** 
  * 最大录制时长，单位秒，默认60s
  */
 maxDuration?: number;

 /** 
  * 最小录制时长，单位秒，默认1s
  */
 minDuration?: number;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface playVoiceParams {
 /** 
  * 音频文件路径
  */
 filePath?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface httpRequestParams {
 /** 
  * 目标服务器 url
  */
 url?: string;

 /** 
  * 设置请求的 HTTP 头，默认 {'Content-Type': 'pplication/x-www-form-urlencoded'}。其中不能设置UserAgent
  */
 headers?: Object;

 /** 
  * 默认 GET，目前支持 GET, POST
  */
 method?: string;

 /** 
  * 请求的参数
  */
 data?: string;

 /** 
  * 超时时间，单位为 ms，默认 30000
  */
 timeout?: number;

 /** 
  * 期望返回的数据格式，默认 json，支持 json, text, base64
  */
 dataType?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface connectSocketParams {
 /** 
  * 开发者服务器接口地址，必须是 wss 协议，且域名必须是后台配置的合法域名
  */
 url?: string;

 /** 
  * 请求的数据
  */
 data?: Object;

 /** 
  * HTTP Header , header 中不能设置 Referer
  */
 header?: Object;

 /** 
  * 默认是GET，有效值为： OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
  */
 method?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface sendSocketMessageParams {
 /** 
  * 需要发送的内容
  */
 data?: string | ArrayBuffer;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface onSocketMessageParams {
 /** 
  * 
  */
 data: string | ArrayBuffer;

}
interface getAuthCodeParams {
 /** 
  * 授权类型，默认 auth_base。支持 auth_base(静默授权)/auth_user(主动授权)
  */
 scopes?: string | Array<string>;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface tradePayParams {
 /** 
  * 完整的支付参数拼接成的字符串，从服务端获取
  */
 orderStr?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface reportAnalyticsParams {
 /** 
  * 自定义事件名，需申请内部可 @习祯
  */
 eventName: string;

 /** 
  * 上报的数据
  */
 data: Object;

}
interface setStorageParams {
 /** 
  * 缓存数据的 key
  */
 key?: string;

 /** 
  * 要缓存的数据
  */
 data?: Object | string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface getStorageParams {
 /** 
  * 缓存数据的 key
  */
 key?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface removeStorageParams {
 /** 
  * 缓存数据的 key
  */
 key?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface chooseCityParams {
 /** 
  * 是否显示当前定位城市，默认 false
  */
 showLocatedCity?: boolean;

 /** 
  * 是否显示热门城市，默认 true
  */
 showHotCities?: boolean;

 /** 
  * 自定义城市列表，列表内对象字段见下表
  */
 cities?: Object | Array<string>;

 /** 
  * 自定义热门城市列表，列表内对象字段见下表
  */
 hotCities?: Object | Array<string>;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface chooseAlipayContactParams {
 /** 
  * 单次最多选择联系人个数，默认 1，最大 10
  */
 count?: number;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface datePickerParams {
 /** 
  * 返回的日期格式，默认 yyyy-MM-dd。支持 HH:mm:ss, yyyy-MM-dd, yyyy-MM-dd HH:mm:ss 三种格式
  */
 format?: string;

 /** 
  * 初始选择的日期时间，默认当前时间
  */
 currentDate?: string;

 /** 
  * 最小日期时间
  */
 startDate?: string;

 /** 
  * 最大日期时间
  */
 endDate?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface alertParams {
 /** 
  * alert 框的标题
  */
 title?: string;

 /** 
  * alert 框的内容
  */
 content?: string;

 /** 
  * 按钮文字，默认’确定’
  */
 buttonText?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface confirmParams {
 /** 
  * confirm 框的标题
  */
 title?: string;

 /** 
  * confirm 框的内容
  */
 content?: string;

 /** 
  * 确定按钮文字，默认’确定’
  */
 confirmButtonText?: string;

 /** 
  * 取消按钮文字，默认’取消’
  */
 cancelButtonText?: string;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface showToastParams {
 /** 
  * 文字内容
  */
 content?: string;

 /** 
  * toast 类型，展示相应图标，默认 none，支持 success / fail / exception / none’。其中 exception 类型必须传文字信息
  */
 type?: string;

 /** 
  * 显示时长，单位为 ms，默认 2000
  */
 duration?: number;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface showLoadingParams {
 /** 
  * loading 的文字提示
  */
 content?: string;

 /** 
  * 延迟显示，单位 ms，默认 0。如果在此时间之前调用了 ap.hideLoading 则不会显示
  */
 delay?: number;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface showActionSheetParams {
 /** 
  * 菜单标题
  */
 title?: string;

 /** 
  * 菜单按钮的文字数组
  */
 items?: string | Array<string>;

 /** 
  * 取消按钮文案，默认为「取消」
  */
 cancelButtonText?: string;

 /** 
  * （IOS特殊处理）指定按钮的索引号，从0开始，使用场景：需要删除或清除数据等类似场景，默认红色
  */
 destructiveBtnIndex?: number;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface redirectToParams {
 /** 
  * 需要跳转的应用内非 tabBar 的页面的路径，路径后可以带参数。参数与路径之间使用
  */
 url: string;

}
interface navigateBackParams {
 /** 
  * 返回的页面数，如果 delta 大于现有页面数，则返回到首页。
  */
 delta: number;

}
interface setNavigationBarParams {
 /** 
  * 导航栏标题
  */
 title?: string;

 /** 
  * 导航栏背景色，支持 16 进制颜色值
  */
 backgroundColor?: string;

 /** 
  * 导航栏底部边框颜色，支持16进制颜色值。若设置了 backgroundColor，borderBottomColor 会不生效，默认会和 backgroundColor 颜色一样。
  */
 borderBottomColor?: string;

 /** 
  * 是否重置导航栏为支付宝默认配色，默认 false
  */
 reset?: boolean;

  /** 
   * 接口调用成功的回调函数
   * @param res 成功返回参数 
   */
  success? (res: Object): void;

  /** 
   * 接口调用失败的回调函数
   * @param error 失败返回错误码 
   */
  fail? (error: number): void;

  /** 
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete? (): void;

}
interface switchTabParams {
 /** 
  * 需要跳转的 tabBar 页面的路径（需在 app.json 的 tabBar 字段定义的页面），路径后不能带参数
  */
 url: string;

}


interface Abridge {

  /**
   * 初始化蓝牙适配器。
   *
   * 


   */
  openBluetoothAdapter(): void;
  
  /**
   * 关闭本机蓝牙模块。
   *
   * 


   */
  closeBluetoothAdapter(): void;
  
  /**
   * 获取本机蓝牙模块状态。
   *
   * 


   */
  getBluetoothAdapterState(): void;
  
  /**
   * 开始搜寻附近的蓝牙外围设备。搜索结果将在 bluetoothDeviceFound 事件中返回。
   *
   * @param apiParams abridge api startBluetoothDevicesDiscovery params object
--------------------------
参数                   描述
services            蓝牙设备主 service 的 uuid 列表
   */
  startBluetoothDevicesDiscovery(apiParams: startBluetoothDevicesDiscoveryParams): void;
  
  /**
   * 停止搜寻附近的蓝牙外围设备。
   *
   * 


   */
  stopBluetoothDevicesDiscovery(): void;
  
  /**
   * 获取所有已发现的蓝牙设备，包括已经和本机处于连接状态的设备。
   *
   * @param apiParams abridge api getBluetoothDevices params object
--------------------------
参数                   描述
services            蓝牙设备主 service 的 uuid 列表
   */
  getBluetoothDevices(apiParams: getBluetoothDevicesParams): void;
  
  /**
   * 根据service的uuid获取处于已连接状态的设备。
   *
   * @param apiParams abridge api getConnectedBluetoothDevices params object
--------------------------
参数                   描述
services            蓝牙设备主 service 的 uuid 列表
   */
  getConnectedBluetoothDevices(apiParams: getConnectedBluetoothDevicesParams): void;
  
  /**
   * 连接低功耗蓝牙设备。
   *
   * @param apiParams abridge api connectBLEDevice params object
--------------------------
参数                   描述
deviceId            蓝牙设备id
   */
  connectBLEDevice(apiParams: connectBLEDeviceParams): void;
  
  /**
   * 断开与低功耗蓝牙设备的连接。
   *
   * @param apiParams abridge api disconnectBLEDevice params object
--------------------------
参数                   描述
deviceId            蓝牙设备id
   */
  disconnectBLEDevice(apiParams: disconnectBLEDeviceParams): void;
  
  /**
   * 向低功耗蓝牙设备特征值中写入数据。
   *
   * @param apiParams abridge api writeBLECharacteristicValue params object
--------------------------
参数                   描述
deviceId            蓝牙设备 id，参考 device 对象
serviceId           蓝牙特征值对应 service 的 uuid
characteristicId    蓝牙特征值的 uuid
descriptorId        notify 的 descriptor 的 uuid （只有android 会用到，非必填，默认值00002902-0000-1000-8000-00805f9b34fb）
value               蓝牙设备特征值对应的值，16进制字符串
   */
  writeBLECharacteristicValue(apiParams: writeBLECharacteristicValueParams): void;
  
  /**
   * 读取低功耗蓝牙设备特征值中的数据。调用后在
   *
   * @param apiParams abridge api readBLECharacteristicValue params object
--------------------------
参数                   描述
deviceId            蓝牙设备 id，参考 device 对象
serviceId           蓝牙特征值对应 service 的 uuid
characteristicId    蓝牙特征值的 uuid
descriptorId        notify 的 descriptor 的 uuid （只有android 会用到，非必填，默认值00002902-0000-1000-8000-00805f9b34fb）
   */
  readBLECharacteristicValue(apiParams: readBLECharacteristicValueParams): void;
  
  /**
   * 启用低功耗蓝牙设备特征值变化时的 notify 功能。注意：必须设备的特征值支持notify才可以成功调用，具体参照 characteristic 的 properties 属性 另外，必须先启用notify才能监听到设备 characteristicValueChange 事件。
   *
   * @param apiParams abridge api notifyBLECharacteristicValueChange params object
--------------------------
参数                   描述
deviceId            蓝牙设备 id，参考 device 对象
serviceId           蓝牙特征值对应 service 的 uuid
characteristicId    蓝牙特征值的 uuid
descriptorId        notify 的 descriptor 的 uuid （只有android 会用到，非必填，默认值00002902-0000-1000-8000-00805f9b34fb）
   */
  notifyBLECharacteristicValueChange(apiParams: notifyBLECharacteristicValueChangeParams): void;
  
  /**
   * 获取蓝牙设备所有 service（服务）
   *
   * @param apiParams abridge api getBLEDeviceServices params object
--------------------------
参数                   描述
deviceId            蓝牙设备 id，参考 device 对象
   */
  getBLEDeviceServices(apiParams: getBLEDeviceServicesParams): void;
  
  /**
   * 获取蓝牙设备所有 characteristic（特征值）
   *
   * @param apiParams abridge api getBLEDeviceCharacteristics params object
--------------------------
参数                   描述
deviceId            蓝牙设备 id，参考 device 对象
serviceId           蓝牙设备服务的 uuid
   */
  getBLEDeviceCharacteristics(apiParams: getBLEDeviceCharacteristicsParams): void;
  
  /**
   * 寻找到新的蓝牙设备时触发此事件。
   *
   * 


   */
  onBluetoothDeviceFound(): void;
  
  /**
   * 移除寻找到新的蓝牙设备事件的监听。
   *
   * 


   */
  offBluetoothDeviceFound(): void;
  
  /**
   * 监听低功耗蓝牙设备的特征值变化的事件。
   *
   * 


   */
  onBLECharacteristicValueChange(): void;
  
  /**
   * 移除低功耗蓝牙设备的特征值变化事件的监听。
   *
   * 


   */
  offBLECharacteristicValueChange(): void;
  
  /**
   * 监听低功耗蓝牙连接的错误事件，包括设备丢失，连接异常断开等。
   *
   * 


   */
  onBLEConnectionStateChanged(): void;
  
  /**
   * 移除低功耗蓝牙连接的错误事件的监听。
   *
   * 


   */
  offBLEConnectionStateChanged(): void;
  
  /**
   * 监听本机蓝牙状态变化的事件。
   *
   * 


   */
  onBluetoothAdapterStateChange(): void;
  
  /**
   * 移除本机蓝牙状态变化的事件的监听。
 
   *
   * 


   */
  offBluetoothAdapterStateChange(): void;
  
  /**
   * 获取系统信息。
   *
   * 


   */
  getSystemInfo(): void;
  
  /**
   * 返回值同 getSystemInfo success 回调参数
   *
   * 


   */
  getSystemInfoSync(): void;
  
  /**
   * 获取当前网络状态。
   *
   * 


   */
  getNetworkType(): void;
  
  /**
   * 获取剪贴板数据。
   *
   * 


   */
  getClipboard(): void;
  
  /**
   * 设置剪贴板数据。
   *
   * @param apiParams abridge api setClipboard params object
--------------------------
参数                   描述
text                剪贴板数据
   */
  setClipboard(apiParams: setClipboardParams): void;
  
  /**
   * 调用扫一扫功能。
   *
   * @param apiParams abridge api scan params object
--------------------------
参数                   描述
type                扫描目标类型，支持 qr / bar，相应扫码选框会不同，默认 qr
   */
  scan(apiParams: scanParams): void;
  
  /**
   * 摇一摇功能。每次调用API，在摇一摇手机后触发回调，如需再次监听需要再次调用这个API。
   *
   * 


   */
  watchShake(): void;
  
  /**
   * 调用震动功能。
   *
   * 


   */
  vibrate(): void;
  
  /**
   * 拨打电话。
   *
   * @param apiParams abridge api makePhoneCall params object
--------------------------
参数                   描述
number              电话号码
   */
  makePhoneCall(apiParams: makePhoneCallParams): void;
  
  /**
   * 获取当前服务器时间的毫秒数。
   *
   * 


   */
  getServerTime(): void;
  
  /**
   * 监听重力感应变化。
   *
   * 


   */
  onAccelerometerChange(): void;
  
  /**
   * 停止监听重力感应变化。
   *
   * 


   */
  offAccelerometerChange(): void;
  
  /**
   * 监听罗盘数据变化。
   *
   * 


   */
  onCompassChange(): void;
  
  /**
   * 停止监听罗盘数据变化。
   *
   * 


   */
  offCompassChange(): void;
  
  /**
   * 获取用户当前的地理位置信息。
   *
   * @param apiParams abridge api getLocation params object
--------------------------
参数                   描述
cacheTimeout        钱包经纬度定位缓存过期时间，单位秒。默认 30s。使用缓存会加快定位速度，缓存过期会重新定位
timeout             定位超时失败回调时间，单位秒。默认10s
   */
  getLocation(apiParams: getLocationParams): void;
  
  /**
   * 使用支付宝内置地图查看位置。
   *
   * @param apiParams abridge api openLocation params object
--------------------------
参数                   描述
longitude           经度
latitude            纬度
name                位置名称
address             地址的详细说明
scale               缩放比例，范围 3~19，默认为 15
   */
  openLocation(apiParams: openLocationParams): void;
  
  /**
   * 使用后台播放器播放音乐。
   *
   * @param apiParams abridge api playBackgroundAudio params object
--------------------------
参数                   描述
url                 音乐链接地址
title               音乐标题
singer              演唱者
describe            音乐描述
logo                logo URL
cover               封面 URL
   */
  playBackgroundAudio(apiParams: playBackgroundAudioParams): void;
  
  /**
   * 暂停播放音乐。
   *
   * 


   */
  pauseBackgroundAudio(): void;
  
  /**
   * 停止播放音乐。
   *
   * 


   */
  stopBackgroundAudio(): void;
  
  /**
   * 控制音乐播放进度。
   *
   * @param apiParams abridge api seekBackgroundAudio params object
--------------------------
参数                   描述
position            音乐位置，单位秒
   */
  seekBackgroundAudio(apiParams: seekBackgroundAudioParams): void;
  
  /**
   * 获取后台音乐播放状态。
   *
   * 


   */
  getBackgroundAudioPlayerState(): void;
  
  /**
   * 开始播放音乐时触发此事件。
   *
   * 


   */
  onBackgroundAudioPlay(): void;
  
  /**
   * 暂停播放音乐时触发此事件。
   *
   * 


   */
  onBackgroundAudioPause(): void;
  
  /**
   * 停止播放音乐时触发此事件。
   *
   * 


   */
  onBackgroundAudioStop(): void;
  
  /**
   * 停止监听音乐播放事件。
   *
   * 


   */
  offBackgroundAudioPlay(): void;
  
  /**
   * 停止监听音乐暂停事件。
   *
   * 


   */
  offBackgroundAudioPause(): void;
  
  /**
   * 停止监听音乐停止事件。
   *
   * 


   */
  offBackgroundAudioStop(): void;
  
  /**
   * 创建并返回 audio 上下文 
   *
   * 


   */
  createAudioContext(audioId): void;
  
  /**
   * 录制或从手机相册中选择视频。
   *
   * @param apiParams abridge api chooseVideo params object
--------------------------
参数                   描述
maxDuration         最大录制时长，单位秒，默认60s
sourceType          相册选取或者拍照，默认 
camera              前置或者后置摄像头，默认前后都有，即：
   */
  chooseVideo(apiParams: chooseVideoParams): void;
  
  /**
   * 上传本地资源到开发者服务器。
   *
   * @param apiParams abridge api uploadFile params object
--------------------------
参数                   描述
url                 开发者服务器地址
filePath            要上传文件资源的本地定位符
fileName            文件名，即对应的 key, 开发者在服务器端通过这个 key 可以获取到文件二进制内容
fileType            文件类型，image/video
headers             HTTP 请求 Header
formData            HTTP 请求中其他额外的 form 数据
   */
  uploadFile(apiParams: uploadFileParams): void;
  
  /**
   * 下载文件资源到本地。
   *
   * @param apiParams abridge api downloadFile params object
--------------------------
参数                   描述
url                 下载文件地址
headers             HTTP 请求 Header
   */
  downloadFile(apiParams: downloadFileParams): void;
  
  /**
   * 拍照或从手机相册中选择图片。
   *
   * @param apiParams abridge api chooseImage params object
--------------------------
参数                   描述
count               最大可选照片数，默认1张，上限9张
sourceType          相册选取或者拍照，默认 
   */
  chooseImage(apiParams: chooseImageParams): void;
  
  /**
   * 预览图片。
   *
   * @param apiParams abridge api previewImage params object
--------------------------
参数                   描述
urls                要预览的图片链接列表
current             当前显示图片索引，默认 0
   */
  previewImage(apiParams: previewImageParams): void;
  
  /**
   * 保存在线图片到手机相册。
   *
   * @param apiParams abridge api saveImage params object
--------------------------
参数                   描述
url                 要保存的图片链接
showActionSheet     是否显示图片操作菜单，默认 true
   */
  saveImage(apiParams: saveImageParams): void;
  
  /**
   * 开始录音。当主动调用 
   *
   * @param apiParams abridge api startRecord params object
--------------------------
参数                   描述
maxDuration         最大录制时长，单位秒，默认60s
minDuration         最小录制时长，单位秒，默认1s
   */
  startRecord(apiParams: startRecordParams): void;
  
  /**
   * 结束录音。
   *
   * 


   */
  stopRecord(): void;
  
  /**
   * 取消录音。
   *
   * 


   */
  cancelRecord(): void;
  
  /**
   * 创建并返回 video 上下文 
   *
   * 


   */
  createVideoContext(videoId): void;
  
  /**
   * 开始播放语音。
   *
   * @param apiParams abridge api playVoice params object
--------------------------
参数                   描述
filePath            音频文件路径
   */
  playVoice(apiParams: playVoiceParams): void;
  
  /**
   * 暂停播放语音。
   *
   * 


   */
  pauseVoice(): void;
  
  /**
   * 继续播放语音。
   *
   * 


   */
  resumeVoice(): void;
  
  /**
   * 停止播放语音。
   *
   * 


   */
  stopVoice(): void;
  
  /**
   * 向指定服务器发起一个跨域 http 请求。
   *
   * @param apiParams abridge api httpRequest params object
--------------------------
参数                   描述
url                 目标服务器 url
headers             设置请求的 HTTP 头，默认 {'Content-Type': 'pplication/x-www-form-urlencoded'}。其中不能设置UserAgent
method              默认 GET，目前支持 GET, POST
data                请求的参数
timeout             超时时间，单位为 ms，默认 30000
dataType            期望返回的数据格式，默认 json，支持 json, text, base64
   */
  httpRequest(apiParams: httpRequestParams): void;
  
  /**
   * 创建一个 
   *
   * @param apiParams abridge api connectSocket params object
--------------------------
参数                   描述
url                 开发者服务器接口地址，必须是 wss 协议，且域名必须是后台配置的合法域名
data                请求的数据
header              HTTP Header , header 中不能设置 Referer
method              默认是GET，有效值为： OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
   */
  connectSocket(apiParams: connectSocketParams): void;
  
  /**
   * 监听WebSocket连接打开事件。
   *
   * 


   */
  onSocketOpen(): void;
  
  /**
   * 监听WebSocket错误。
   *
   * 


   */
  onSocketError(): void;
  
  /**
   * 通过 WebSocket 连接发送数据，需要先 
   *
   * @param apiParams abridge api sendSocketMessage params object
--------------------------
参数                   描述
data                需要发送的内容
   */
  sendSocketMessage(apiParams: sendSocketMessageParams): void;
  
  /**
   * 监听WebSocket接受到服务器的消息事件。
   *
   * @param apiParams abridge api onSocketMessage params object
--------------------------
参数                   描述
data                
   */
  onSocketMessage(apiParams: onSocketMessageParams): void;
  
  /**
   * 关闭WebSocket连接。
   *
   * 


   */
  closeSocket(): void;
  
  /**
   * 监听WebSocket关闭。
   *
   * 


   */
  onSocketClose(): void;
  
  /**
   * 获取授权码。
   *
   * @param apiParams abridge api getAuthCode params object
--------------------------
参数                   描述
scopes              授权类型，默认 auth_base。支持 auth_base(静默授权)/auth_user(主动授权)
   */
  getAuthCode(apiParams: getAuthCodeParams): void;
  
  /**
   * 获取授权用户信息。
   *
   * 


   */
  getAuthUserInfo(): void;
  
  /**
   * 发起支付。
   *
   * @param apiParams abridge api tradePay params object
--------------------------
参数                   描述
orderStr            完整的支付参数拼接成的字符串，从服务端获取
   */
  tradePay(apiParams: tradePayParams): void;
  
  /**
   * 自定义分析数据上报接口。
   *
   * @param apiParams abridge api reportAnalytics params object
--------------------------
参数                   描述
eventName           自定义事件名，需申请内部可 @习祯
data                上报的数据
   */
  reportAnalytics(apiParams: reportAnalyticsParams): void;
  
  /**
   * 将页面滚动到目标位置。
   *
   * 


   */
  pageScrollTo(): void;
  
  /**
   * 将数据存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的数据。
   *
   * @param apiParams abridge api setStorage params object
--------------------------
参数                   描述
key                 缓存数据的 key
data                要缓存的数据
   */
  setStorage(apiParams: setStorageParams): void;
  
  /**
   * 同步将数据存储在本地缓存中指定的 key 中
   *
   * 


   */
  setStorageSync(): void;
  
  /**
   * 获取缓存数据。
   *
   * @param apiParams abridge api getStorage params object
--------------------------
参数                   描述
key                 缓存数据的 key
   */
  getStorage(apiParams: getStorageParams): void;
  
  /**
   * 同步获取缓存数据。
   *
   * 


   */
  getStorageSync(): void;
  
  /**
   * 删除缓存数据。
   *
   * @param apiParams abridge api removeStorage params object
--------------------------
参数                   描述
key                 缓存数据的 key
   */
  removeStorage(apiParams: removeStorageParams): void;
  
  /**
   * 同步删除缓存数据。
   *
   * 


   */
  removeStorageSync(): void;
  
  /**
   * 创建一个动画实例
   *
   * 


   */
  createAnimation(): void;
  
  /**
   * 创建 canvas 绘图上下文（指定 canvasId）
   *
   * 


   */
  createCanvasContext(canvasId): void;
  
  /**
   * 打开城市选择列表。
   *
   * @param apiParams abridge api chooseCity params object
--------------------------
参数                   描述
showLocatedCity     是否显示当前定位城市，默认 false
showHotCities       是否显示热门城市，默认 true
cities              自定义城市列表，列表内对象字段见下表
hotCities           自定义热门城市列表，列表内对象字段见下表
   */
  chooseCity(apiParams: chooseCityParams): void;
  
  /**
   * 选择本地系统通信录中某个联系人的电话。
   *
   * 


   */
  choosePhoneContact(): void;
  
  /**
   * 唤起支付宝通讯录，选择一个或者多个支付宝联系人。
   *
   * @param apiParams abridge api chooseAlipayContact params object
--------------------------
参数                   描述
count               单次最多选择联系人个数，默认 1，最大 10
   */
  chooseAlipayContact(apiParams: chooseAlipayContactParams): void;
  
  /**
   * 打开日期选择列表。
   *
   * @param apiParams abridge api datePicker params object
--------------------------
参数                   描述
format              返回的日期格式，默认 yyyy-MM-dd。支持 HH:mm:ss, yyyy-MM-dd, yyyy-MM-dd HH:mm:ss 三种格式
currentDate         初始选择的日期时间，默认当前时间
startDate           最小日期时间
endDate             最大日期时间
   */
  datePicker(apiParams: datePickerParams): void;
  
  /**
   * alert 警告框。
   *
   * @param apiParams abridge api alert params object
--------------------------
参数                   描述
title               alert 框的标题
content             alert 框的内容
buttonText          按钮文字，默认’确定’
   */
  alert(apiParams: alertParams): void;
  
  /**
   * confirm 确认框。
   *
   * @param apiParams abridge api confirm params object
--------------------------
参数                   描述
title               confirm 框的标题
content             confirm 框的内容
confirmButtonText   确定按钮文字，默认’确定’
cancelButtonText    取消按钮文字，默认’取消’
   */
  confirm(apiParams: confirmParams): void;
  
  /**
   * 显示一个弱提示，可选择多少秒之后消失。
   *
   * @param apiParams abridge api showToast params object
--------------------------
参数                   描述
content             文字内容
type                toast 类型，展示相应图标，默认 none，支持 success / fail / exception / none’。其中 exception 类型必须传文字信息
duration            显示时长，单位为 ms，默认 2000
   */
  showToast(apiParams: showToastParams): void;
  
  /**
   * 隐藏弱提示。
   *
   * 


   */
  hideToast(): void;
  
  /**
   * 显示加载提示。
   *
   * @param apiParams abridge api showLoading params object
--------------------------
参数                   描述
content             loading 的文字提示
delay               延迟显示，单位 ms，默认 0。如果在此时间之前调用了 ap.hideLoading 则不会显示
   */
  showLoading(apiParams: showLoadingParams): void;
  
  /**
   * 隐藏加载提示。
   *
   * 


   */
  hideLoading(): void;
  
  /**
   * 显示导航栏 loading。
   *
   * 


   */
  showNavigationBarLoading(): void;
  
  /**
   * 隐藏导航栏 loading。
   *
   * 


   */
  hideNavigationBarLoading(): void;
  
  /**
   * 显示操作菜单。
   *
   * @param apiParams abridge api showActionSheet params object
--------------------------
参数                   描述
title               菜单标题
items               菜单按钮的文字数组
cancelButtonText    取消按钮文案，默认为「取消」
destructiveBtnIndex （IOS特殊处理）指定按钮的索引号，从0开始，使用场景：需要删除或清除数据等类似场景，默认红色
   */
  showActionSheet(apiParams: showActionSheetParams): void;
  
  /**
   * 隐藏键盘。
   *
   * 


   */
  hideKeyboard(): void;
  
  /**
   * 创建并返回 map 上下文 
   *
   * 


   */
  createMapContext(mapId): void;
  
  /**
   * 保留当前页面，跳转到应用内的某个页面，使用 
   *
   * 


   */
  navigateTo(): void;
  
  /**
   * 关闭当前页面，跳转到应用内的某个页面。
   *
   * @param apiParams abridge api redirectTo params object
--------------------------
参数                   描述
url                 需要跳转的应用内非 tabBar 的页面的路径，路径后可以带参数。参数与路径之间使用
   */
  redirectTo(apiParams: redirectToParams): void;
  
  /**
   * 关闭当前页面，返回上一页面或多级页面。可通过 
   *
   * @param apiParams abridge api navigateBack params object
--------------------------
参数                   描述
delta               返回的页面数，如果 delta 大于现有页面数，则返回到首页。
   */
  navigateBack(apiParams: navigateBackParams): void;
  
  /**
   * 设置导航栏文字及样式。
   *
   * @param apiParams abridge api setNavigationBar params object
--------------------------
参数                   描述
title               导航栏标题
backgroundColor     导航栏背景色，支持 16 进制颜色值
borderBottomColor   导航栏底部边框颜色，支持16进制颜色值。若设置了 backgroundColor，borderBottomColor 会不生效，默认会和 backgroundColor 颜色一样。
reset               是否重置导航栏为支付宝默认配色，默认 false
   */
  setNavigationBar(apiParams: setNavigationBarParams): void;
  
  /**
   * 显示导航栏 loading。
   *
   * 


   */
  showNavigationBarLoading(): void;
  
  /**
   * 隐藏导航栏 loading。
   *
   * 


   */
  hideNavigationBarLoading(): void;
  
  /**
   * 停止当前页面的下拉刷新。
   *
   * 


   */
  stopPullDownRefresh(): void;
  
  /**
   * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面。
   *
   * @param apiParams abridge api switchTab params object
--------------------------
参数                   描述
url                 需要跳转的 tabBar 页面的路径（需在 app.json 的 tabBar 字段定义的页面），路径后不能带参数
   */
  switchTab(apiParams: switchTabParams): void;
  
}

declare const abridge: Abridge;

declare module "abridge" {
    export = abridge;
}


interface Abridge {

  openBluetoothAdapter(): void;
  
  closeBluetoothAdapter(): void;
  
  getBluetoothAdapterState(): void;
  
  startBluetoothDevicesDiscovery(): void;
  
  stopBluetoothDevicesDiscovery(): void;
  
  getBluetoothDevices(): void;
  
  getConnectedBluetoothDevices(): void;
  
  connectBLEDevice(): void;
  
  disconnectBLEDevice(): void;
  
  writeBLECharacteristicValue(): void;
  
  readBLECharacteristicValue(): void;
  
  notifyBLECharacteristicValueChange(): void;
  
  getBLEDeviceServices(): void;
  
  getBLEDeviceCharacteristics(): void;
  
  onBluetoothDeviceFound(): void;
  
  offBluetoothDeviceFound(): void;
  
  onBLECharacteristicValueChange(): void;
  
  offBLECharacteristicValueChange(): void;
  
  onBLEConnectionStateChanged(): void;
  
  offBLEConnectionStateChanged(): void;
  
  onBluetoothAdapterStateChange(): void;
  
  offBluetoothAdapterStateChange(): void;
  
  getSystemInfo(): void;
  
  getSystemInfoSync(): void;
  
  getNetworkType(): void;
  
  getClipboard(): void;
  
  setClipboard(): void;
  
  scan(): void;
  
  watchShake(): void;
  
  vibrate(): void;
  
  makePhoneCall(): void;
  
  getServerTime(): void;
  
  onAccelerometerChange(): void;
  
  offAccelerometerChange(): void;
  
  onCompassChange(): void;
  
  offCompassChange(): void;
  
  getLocation(): void;
  
  openLocation(): void;
  
  playBackgroundAudio(): void;
  
  pauseBackgroundAudio(): void;
  
  stopBackgroundAudio(): void;
  
  seekBackgroundAudio(): void;
  
  getBackgroundAudioPlayerState(): void;
  
  onBackgroundAudioPlay(): void;
  
  onBackgroundAudioPause(): void;
  
  onBackgroundAudioStop(): void;
  
  offBackgroundAudioPlay(): void;
  
  offBackgroundAudioPause(): void;
  
  offBackgroundAudioStop(): void;
  
  createAudioContext(audioId)(): void;
  
  chooseVideo(): void;
  
  uploadFile(): void;
  
  downloadFile(): void;
  
  chooseImage(): void;
  
  previewImage(): void;
  
  saveImage(): void;
  
  startRecord(): void;
  
  stopRecord(): void;
  
  cancelRecord(): void;
  
  createVideoContext(videoId)(): void;
  
  playVoice(): void;
  
  pauseVoice(): void;
  
  resumeVoice(): void;
  
  stopVoice(): void;
  
  httpRequest(): void;
  
  connectSocket(): void;
  
  onSocketOpen(): void;
  
  onSocketError(): void;
  
  sendSocketMessage(): void;
  
  onSocketMessage(): void;
  
  closeSocket(): void;
  
  onSocketClose(): void;
  
  getAuthCode(): void;
  
  getAuthUserInfo(): void;
  
  tradePay(): void;
  
  reportAnalytics(): void;
  
  pageScrollTo(): void;
  
  setStorage(): void;
  
  setStorageSync(): void;
  
  getStorage(): void;
  
  getStorageSync(): void;
  
  removeStorage(): void;
  
  removeStorageSync(): void;
  
  createAnimation(): void;
  
  createCanvasContext(canvasId)(): void;
  
  chooseCity(): void;
  
  choosePhoneContact(): void;
  
  chooseAlipayContact(): void;
  
  datePicker(): void;
  
  alert(): void;
  
  confirm(): void;
  
  showToast(): void;
  
  hideToast(): void;
  
  showLoading(): void;
  
  hideLoading(): void;
  
  showNavigationBarLoading(): void;
  
  hideNavigationBarLoading(): void;
  
  showActionSheet(): void;
  
  hideKeyboard(): void;
  
  createMapContext(mapId)(): void;
  
  navigateTo(): void;
  
  redirectTo(): void;
  
  navigateBack(): void;
  
  setNavigationBar(): void;
  
  showNavigationBarLoading(): void;
  
  hideNavigationBarLoading(): void;
  
  stopPullDownRefresh(): void;
  
  switchTab(): void;
  
}

declare var Abridge: {
    prototype: Abridge;
    new(): Abridge;
};

declare var abridge: Abridge;

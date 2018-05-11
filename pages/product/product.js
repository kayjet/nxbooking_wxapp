//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    product:{}
  },
  onLoad: function (option) {
    this.setData({
      product: app.globalData.viewProduct
    })
  }
})

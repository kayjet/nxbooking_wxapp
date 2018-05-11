//bill.js
import utils from '../../utils/util';
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    orderDetail: {},
    shopDetail: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  //事件处理函数
  onNavToOrder: function () {
    if (this.data.selectedShop == undefined) {
      return;
    }
    wx.navigateTo({
      url: '../order/index?shopId=' + this.data.selectedShop.id
    })
  },
  repay: function () {
    var orderNo = app.globalData.orderDetail.orderNo;
    var url = 'https://www.opdar.com/booking/api/sp3/order/reMakeOrder?orderNo=' + orderNo;
    var that = this;
    wx.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: function (reponse) {

        if (reponse.data.code == 0) {
          wx.showLoading({
            mask: true
          })
          wx.requestPayment({
            timeStamp: reponse.data.data.timeStamp,
            nonceStr: reponse.data.data.nonceStr,
            package: reponse.data.data.prepay_id,
            signType: reponse.data.data.signType,
            paySign: reponse.data.data.paySign,
            success: function (res) {
              console.log("paySuccess", res);
              wx.showToast({
                title: '支付成功',
                icon: 'none',
                duration: 1500,
                mask: true
              })
            },
            fail: function (res) {
              console.log("payFail", res);
              wx.showToast({
                title: '支付失败',
                icon: 'none',
                duration: 1000,
                mask: true
              })
            },
            complete: function (res) {
              console.log("payComplete", res);
              wx.hideLoading()
              wx.redirectTo({
                url: '../my-order-list/myOrderList'
              })
            },
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  onLoad: function () {
    var that = this;
    console.log("app.globalData.orderDetail", app.globalData.orderDetail);
    var d = app.globalData.orderDetail;
    var shopDetail = app.globalData.shopDetail;
    that.setData({
      orderDetail: d,
      shopDetail: shopDetail
    })
  }
})

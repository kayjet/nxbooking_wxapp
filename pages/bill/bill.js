//bill.js
//获取应用实例
import utils from '../../utils/util';
const app = getApp()

Page({
  data: {
    cartItems: [],
    totalPrice: 0,
    phone: '',
    selectedShop: {},
  },
  bindKeyInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  //事件处理函数
  redirectTomyOrderList: function () {
    wx.hideLoading();
    wx.redirectTo({
      url: '../my-order-list/myOrderList'
    })
  },
  showCartDetail: function () {
    if (this.data.cartItems.length == 0) {
      return;
    }
    var ret = !this.data.isCartDetailShow;
    this.setData({
      isCartDetailShow: ret
    });
  },
  createOrder: function () {
    if (this.data.phone == undefined || phone.data.phone.length != 11) {

    }
  },
  payBill: function () {
    if (this.data.selectedShop == undefined) {

      return;
    }
    if (this.data.phone == '') {
      wx.showToast({
        title: "请正确填写手机号",
        icon: "none",
        duration: 2000
      })
      return;
    }
//获取应用实例
    if (!utils.isMobile(this.data.phone )){
      wx.showToast({
        title: "请正确填写手机号",
        icon: "none",
        duration: 2000
      })
      return;
    }
    var that = this;
    // String shopId, String userId, String concatPhone, String totalPrice, String orderTyp
    var shopId = app.globalData.selectedShop.id;
    var userId = app.globalData.userEntity.id;
    var concatPhone = this.data.phone;
    var totalPrice = app.globalData.totalPrice;
    var orderTyp = app.globalData.orderType;
    var url = utils.BASE_URL + 'api/sp3/order/makeOrder?shopId=' + shopId
      + "&userId=" + userId + "&concatPhone=" + concatPhone + "&totalPrice=" + totalPrice + "&orderType=" + orderTyp;
    if (app.globalData.orderTime) {
      url += "&orderTime=" + app.globalData.orderTime;
    }
    var requestData = app.globalData.cartItems;
    wx.showLoading({
      mask: true
    })
    wx.request({
      url: url,
      method: 'post',
      data: requestData,
      header: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      complete: function () {
        wx.hideLoading()
      },
      success: function (reponse) {
        if (reponse.data.code == 0) {
          wx.showToast({
            title: '下单成功',
            icon: 'none',
            duration: 1500,
            mask: true
          })
          wx.requestPayment({
            timeStamp: reponse.data.data.timeStamp,
            nonceStr: reponse.data.data.nonceStr,
            package: reponse.data.data.prepay_id,
            signType: reponse.data.data.signType,
            paySign: reponse.data.data.paySign,
            success: function (res) {
              wx.showLoading({
                mask: true
              });
              wx.showToast({
                title: '支付成功',
                icon: 'none',
                duration: 1000,
                mask: true
              });
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
              app.globalData.cartItems = [];
              that.redirectTomyOrderList();
            },
          })
        }
      }
    });
  },
  onLoad: function () {
    var that = this;
    that.setData({
      cartItems: app.globalData.cartItems,
      totalPrice: app.globalData.totalPrice,
      selectedShop: app.globalData.selectedShop
    })
  }
})

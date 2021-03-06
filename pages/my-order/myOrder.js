//bill.js
import utils from '../../utils/util';
//获取应用实例
const app = getApp();

Page({
    data: {
        orderDetail: {},
        shopDetail: {},
    },
     repay: function () {
        var orderNo = app.globalData.orderDetail.orderNo;
        var url = utils.BASE_URL + 'api/sp3/order/reMakeOrder?orderNo=' + orderNo;
        var that = this;
        wx.showLoading({
            mask: true
        });
        wx.request({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (reponse) {
                wx.hideLoading();
                if (reponse.data.code == 0) {
                    wx.showLoading({
                        mask: true
                    });
                    wx.requestPayment({
                        timeStamp: reponse.data.data.timeStamp,
                        nonceStr: reponse.data.data.nonceStr,
                        package: reponse.data.data.prepay_id,
                        signType: reponse.data.data.signType,
                        paySign: reponse.data.data.paySign,
                        success: function (res) {
                            wx.showToast({
                                title: '支付成功',
                                icon: 'none',
                                duration: 1500,
                                mask: true
                            });
                        },
                        fail: function (res) {
                            wx.showToast({
                                title: '支付失败',
                                icon: 'none',
                                duration: 1000,
                                mask: true
                            });
                        },
                        complete: function (res) {
                            // console.log("reMakeOrder payComplete", res);
                            wx.hideLoading();
                            wx.navigateBack();
                            wx.redirectTo({
                                url: '../my-order-list/myOrderList'
                            });
                        },
                    })
                }
            },
            fail: function (res) {
            },
            complete: function (res) {
                wx.hideLoading();
            },
        })
    },
    onLoad: function () {
        var that = this;
        var d = app.globalData.orderDetail;
        var shopDetail = app.globalData.shopDetail;
        that.setData({
            orderDetail: d,
            shopDetail: shopDetail
        })
    }
})

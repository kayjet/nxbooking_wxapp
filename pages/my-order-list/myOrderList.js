//bill.js
//获取应用实例
import utils from '../../utils/util';
const app = getApp()

Page({
  data: {
    userInfo: {},
    orderRelList:[],
  },
  getMyOrder: function () {
    console.log(app.globalData);
    var that = this;
    var userId = app.globalData.userEntity.id;
    var url = 'https://www.opdar.com/booking/api/sp3/order/getOrder?userId=' + userId;
    wx.request({
      url: url,
      method: 'get',
      complete: function () {
        wx.hideLoading()
      },
      success: function (reponse) {
        if (reponse.data.code == 0){
          var d = reponse.data.data;
          for (var i = 0; i < d.length ; i++){
            d[i].createTime = utils.formatTime(new Date(d[i].createTime));
            d[i].updateTime = utils.formatTime(new Date(d[i].updateTime));
          }
          console.log(d);
          that.setData({
            orderRelList: d
          });
        }
      }
    });
  },
  //事件处理函数
  toMyOrder: function (evt) {
    console.log(this.data.orderRelList[parseInt(evt.currentTarget.dataset.index)].orderList[0]);
    app.globalData.orderDetail = this.data.orderRelList[parseInt(evt.currentTarget.dataset.index)].orderList[0];
    app.globalData.shopDetail = this.data.orderRelList[parseInt(evt.currentTarget.dataset.index)].shopList[0];
    
    wx.navigateTo({
      url: '../my-order/myOrder'
    })
  },

  onLoad: function () {
    var that = this;
    that.getMyOrder(); 
  }
})

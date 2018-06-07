//index.js
//获取应用实例
import utils from '../../utils/util';
const app = getApp();

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + '-' + [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


Page({
  data: {
    userInfo: {},
    searchText: '',
    palceList: [],
    favouriteList: [],
    startTime: '',
    titleIndex: 0,
    lat: undefined,
    lng: undefined,
    hasUserInfo: false,
    selectedShop: undefined,
    orderType: '1',
    time: ''
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    });
    this.setData({
      orderType: 2
    });
  },
  bindKeyInput: function (e) {
    this.setData({
      searchText: e.detail.value
    });
    this.getNearByData();
  },
  onChangeOrderTime: function (evt) {
    if (evt.currentTarget.dataset.index == '0') {
      this.setData({
        time: ''
      });
    }
    this.setData({
      orderType: evt.currentTarget.dataset.ordertype
    });
  },
  delFavShop: function (fkUserId, fkShopId) {
    var that = this;
    var url = utils.BASE_URL + '/api/sp1/user/deleteFavShop';
    var data = {};
    data.fkUserId = fkUserId;
    data.fkShopId = fkShopId;
    wx.showLoading({
      mask: true
    });
    wx.request({
      url: url,
      method: 'get',
      data: data,
      complete: function () {
        wx.hideLoading();
      },
      success: function (reponse) {
        var newArray = [];
        for (var i = 0; i < that.data.favouriteList.length; i++) {
          if (that.data.favouriteList[i].id != fkShopId) {
            newArray.push(that.data.favouriteList[i]);
          } else {
            for (var j = 0; j < that.data.favouriteList.length; j++) {
              if (that.data.palceList[i].id == that.data.favouriteList[j].id) {
                var temp = {};
                var key = "palceList[" + i + "].isFavourite";
                temp[key] = false;
                that.setData(temp);
              }
            }
          }
        }
        that.setData({
          favouriteList: newArray
        })
      }
    });
  },
  getFavShopList: function () {
    var that = this;
    var url = utils.BASE_URL + 'api/sp1/user/getFavShopList';
    var data = {};
    data.fkUserId = app.globalData.userEntity.id;
    wx.showLoading({
      mask: true
    });
    wx.request({
      url: url,
      method: 'get',
      data: data,
      complete: function () {
        wx.hideLoading();
      },
      success: function (reponse) {
        if (reponse.data.data == undefined)
          return;
        that.setData({
          favouriteList: reponse.data.data
        });
        for (var i = 0; i < that.data.palceList.length; i++) {
          for (var j = 0; j < that.data.favouriteList.length; j++) {
            if (that.data.palceList[i].id == that.data.favouriteList[j].id) {
              var temp = {};
              var key = "palceList[" + i + "].isFavourite";
              temp[key] = true;
              that.setData(temp);
            }
          }

        }
      }
    });
  },
  addFavShop: function (fkUserId, fkShopId, collection) {
    var that = this;
    var url = utils.BASE_URL + 'api/sp1/user/addFavShop';
    var data = {};
    data.fkUserId = fkUserId;
    data.fkShopId = fkShopId;
    wx.showLoading({
      mask: true
    })
    wx.request({
      url: url,
      method: 'get',
      data: data,
      complete: function () {
        wx.hideLoading()
      },
      success: function (reponse) {
        var d = that.data.favouriteList.concat([collection]);
        that.setData({
          favouriteList: d
        });
      }
    });

  },
  bindUser: function () {
    var that = this;
    var url = utils.BASE_URL + 'api/sp1/user/bindUser';
    var data = {};
    wx.login({
      success: function (res1) {
        if (res1.errMsg == "login:ok") {
          data.jsCode = res1.code;
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
              that.setData({
                userInfo: res.userInfo,
                hasUserInfo: true
              });
              data.avatarUrl = res.userInfo.avatarUrl;
              data.gender = res.userInfo.gender;
              data.nikeName = res.userInfo.nickName;
              wx.showLoading({
                mask: true
              })
              wx.request({
                url: url,
                method: 'get',
                data: data,
                complete: function () {
                  wx.hideLoading()
                },
                success: function (reponse) {
                  console.log("bindUser", reponse);
                  app.globalData.userEntity = reponse.data.data;
                  that.getFavShopList();
                }
              });

            }
          });

        }

      }
    });

  },
  //事件处理函数
  onNavToOrder: function () {
    if (this.data.selectedShop == undefined) {
      return;
    }
    if (!this.data.selectedShop.open) {
      return;
    }
    app.globalData.selectedShop = this.data.selectedShop;
    app.globalData.orderType = this.data.orderType;
    app.globalData.orderTime = this.data.time;
    wx.navigateTo({
      url: '../order/index?shopId=' + this.data.selectedShop.id
    })
  },
  onDeleteCollection: function (target) {
    var index = parseInt(target.currentTarget.dataset.index);
    this.delFavShop(app.globalData.userEntity.id, this.data.favouriteList[index].id);
  },
  onCollection: function (target) {
    var data = {};
    var index = parseInt(target.currentTarget.dataset.index);
    var ret = !target.currentTarget.dataset.selected.isFavourite;
    var key = "palceList[" + index + "].isFavourite";
    data[key] = ret;
    this.setData(data);
    var collection = this.data.palceList[index];
    // console.log("collection", collection);
    if (!ret) {
      this.delFavShop(app.globalData.userEntity.id, collection.id);
    } else {
      this.addFavShop(app.globalData.userEntity.id, collection.id, collection);
    }

  },
  onClearSearch: function () {
    this.setData({
      searchText: ''
    });
  },
  onChangTitle: function (target) {
    this.cleanSelectNearby();
    this.cleanSelectFavourite();
    this.setData({
      titleIndex: parseInt(target.currentTarget.dataset.index),
      selectedShop: null
    });
  },
  cleanSelectNearby: function () {
    for (var i = 0; i < this.data.palceList.length; i++) {
      var data = {};
      var key = "palceList[" + i + "].isSelected";
      data[key] = false;
      this.setData(data);
    }
  },
  cleanSelectFavourite: function () {
    for (var i = 0; i < this.data.favouriteList.length; i++) {
      var data = {};
      var key = "favouriteList[" + i + "].isSelected";
      data[key] = false;
      this.setData(data);
    }
  },
  onSelectNearby: function (target) {
    this.cleanSelectNearby();
    var data = {};
    var key = "palceList[" + parseInt(target.currentTarget.dataset.index) + "].isSelected";
    var ret = !target.currentTarget.dataset.selected.isSelected;
    data[key] = ret;
    this.setData(data);
    console.log("onSelectNearby", target.currentTarget.dataset.selected);
    if (ret) {
      this.setData({
        selectedShop: target.currentTarget.dataset.selected
      })
    } else {
      this.setData({
        selectedShop: null
      })
    }
  },
  onSelectFavourite: function (target) {
    this.cleanSelectFavourite();
    var data = {};
    var key = "favouriteList[" + parseInt(target.currentTarget.dataset.index) + "].isSelected";
    var ret = !target.currentTarget.dataset.selected.isSelected;
    data[key] = ret;
    this.setData(data);
    if (ret) {
      this.setData({
        selectedShop: target.currentTarget.dataset.selected
      })
    } else {
      this.setData({
        selectedShop: null
      })
    }
  },
  //获取经纬度
  getLocation: function () {
    var that = this
    wx.getLocation({
      success: function (res) {
        // success
        console.log(res);
        that.setData({
          lat: res.latitude,
          lng: res.longitude
        });
        that.getNearByData();

      }
    })
  },
  getNearByData: function () {
    var that = this;
    var url = utils.BASE_URL + 'api/sp1/shop/listPage';
    var data = {};
    if (this.data.lat != undefined) {
      data.lat = this.data.lat;
    }
    if (this.data.lng != undefined) {
      data.lng = this.data.lng;
    }
    if (this.data.searchText != '') {
      data.name = this.data.searchText;
    }
    wx.showLoading({
      mask: true
    })
    wx.request({
      url: url,
      method: 'get',
      data: data,
      complete: function () {
        wx.hideLoading()
      },
      success: function (reponse) {
        if (reponse.data.code != 0)
          return;
        var data = reponse.data.data;
        var dataArray = [];
        for (var i = 0; i < data.length; i++) {
          data[i].isFavourite = false;
          data[i].isSelected = false;
          dataArray.push(data[i]);
        }
        that.setData({ "palceList": dataArray });
      }
    });
  },
  onLoad: function () {
    var that = this;
    this.getNearByData();
    this.getLocation();
    this.bindUser();
    var date = formatTime(new Date());
    this.setData({
      time: date.split("-")[1]
    });
  }
})

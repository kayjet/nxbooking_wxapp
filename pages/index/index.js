//index.js
//获取应用实例
import utils from '../../utils/util';

const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        time: '',
        imgUrls: [],
        indicatorDots: false,
        autoplay: false,
        interval: 5000,
        duration: 1000
    },
    toMyOrder: function () {
        wx.navigateTo({
            url: '../my-order-list/myOrderList'
        })
    },
    goShop: function () {
        wx.navigateTo({
            url: '../shop/index'
        })
    },
    testTap: function () {
        wx.navigateTo({
            url: '/pages/place/index',
        })
    },
    onLoad: function () {
        this.getUserInfo();
        this.getAdv();
    },
    getAdv: function () {
        var that = this;
        var url = utils.BASE_URL + 'api/sp3/advertisement/getAdvertisementList';
        var data = {};
        wx.showLoading({
            mask: true
        });
        wx.request({
            url: url,
            data: data,
            method: 'GET',
            success: function (res) {
                if (res.data.code == 0) {
                    // console.log("getAdvertisementList",res);
                    var d = res.data.data;
                    for (var i = 0; i < d.length; i++) {
                        d[i].pic = utils.BASE_IMG_URL + "" + d[i].pic
                    }
                    that.setData({
                        imgUrls: d
                    });
                }
            },
            fail: function (res) {
            },
            complete: function (res) {
                wx.hideLoading();
            },
        })
    },
    getUserInfo: function (e) {
        var that = this;
        var url = utils.BASE_URL + 'api/sp1/user/bindUser';
        var data = {};

        wx.login({
            success: function (res1) {
                if (res1.errMsg == "login:ok") {
                    data.jsCode = res1.code;
                    wx.getUserInfo({
                        success: res => {
                            // console.log(" wx.login.userInfo", res);
                            app.globalData.userInfo = res.userInfo;
                            that.setData({
                                userInfo: res.userInfo,
                                hasUserInfo: true
                            });
                            data.avatarUrl = res.userInfo.avatarUrl;
                            data.gender = res.userInfo.gender;
                            data.nikeName = res.userInfo.nickName;
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
                                    app.globalData.userEntity = reponse.data.data;
                                }
                            });

                        }
                    });

                }

            }
        });
    }
});

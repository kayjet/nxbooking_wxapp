//获取应用实例
import utils from '../../utils/util';
import customAnimation from '../../utils/custom-animation';
const app = getApp();

Page({
  data: {
    searchText: '',
    leftData: [],
    rightData: [],
    scrollToViewId: '',
    toLeftViewId: '',
    leftIndex: 0,
    titleIndex: 0,
    domQuery: [],
    scrollTop: 0,
    cartItems: [],
    totalPrice: 0,
    rightScrollViewCount: [],
    isCartDetailShow: false,
    isCataShow: false,
    specList: [],
    cataItem: "",
    cataItemPrice: "",
    animationData:null
  },
  closeCataModal: function (evt){
 
    if (evt.target.id =='cataCataModal'){
      this.setData({
        isCataShow:false
      })
    }
  },
  toProductPage: function (evt) {
    var data = this.data.rightData[parseInt(evt.currentTarget.dataset.index)];
    app.globalData.viewProduct = data;
    wx.navigateTo({
      url: '../product/product'
    })
  },
  closeCataory: function () {
    this.setData({
      isCataShow: false,
        animationData:customAnimation.opacityLinearOut(this,"animationData")
    })
  },
  payBill: function () {
    if (this.data.cartItems.length == 0) {
      wx.showToast({
        title: "请添加商品",
        icon: "none",
        duration: 2000
      });
      return;
    }
    app.globalData.cartItems = this.data.cartItems;
    app.globalData.totalPrice = this.data.totalPrice;
    wx.navigateTo({
      url: '../bill/bill'
    })
  },
  getLeftData: function () {
    return { title: '', isActive: false };
  },
  cleanSelectLeft: function () {
    for (var i = 0; i < this.data.leftData.length; i++) {
      var data = {};
      var key = "leftData[" + i + "].isActive";
      data[key] = false;
      this.setData(data);
    }
  },
  scrollLeft: function (event) {

  },
  checkScrolling: function (scrollHandler) {
   
      var that = this;
      if (that.data.timeoutFlag!= undefined){
        clearTimeout(that.data.timeoutFlag);
        that.data.timeoutFlag = undefined;
        return;
      }
      that.data.timeoutFlag = setTimeout(function () {
        scrollHandler.call(that);
      }, 0);
  },
  scrollRight: function (event) {
    var that = this;
    // that.data.scrollTop = event.detail.scrollTop;
    this.setData({
      "scrollTop": event.detail.scrollTop
    });
    function innerClass() {
      for (var i = 0; i < this.data.domQuery.length; i++) {
        if (this.data.scrollTop <= this.data.domQuery[i].top) {
          if (this.data.toLeftViewId == ('leftId' + i)){
            break;
          }
          this.cleanSelectLeft();
          var data = {};
          var key = "leftData[" + i + "].isActive";
          data[key] = true;
          this.setData(data);
          this.setData({
            toLeftViewId: 'leftId' + i
          });
          break;
        }
      }
    }
    this.checkScrolling(innerClass);

  },
  onMinItem: function (evt) {
    var ret = this.data.cartItems;
    ret[evt.currentTarget.dataset.index].pop();
    if (ret[evt.currentTarget.dataset.index].length == 0) {
      var temp = [];
      for (var i = 0; i < ret.length; i++) {
        if (i != evt.currentTarget.dataset.index) {
          temp.push(ret[i]);
        }
      }
      ret = temp;
    }
    this.setData({
      cartItems: ret
    });
    if (ret.length == 0) {
      this.setData({
        isCartDetailShow: false
      });
    }
    var price = 0;
    if (evt.currentTarget.dataset.data.totallyPrice) {
      price = evt.currentTarget.dataset.data.totallyPrice;
    } else {
      price = evt.currentTarget.dataset.data.finalPrice;
    }
    this.setData({
      totalPrice: this.data.totalPrice -= price
    });
  },
  onAddItemOnceMore: function (evt) {
    var ret = this.data.cartItems;
    console.log("ret", ret);
    ret[evt.currentTarget.dataset.index].push(evt.currentTarget.dataset.data);
    this.setData({
      cartItems: ret
    });
    var price = 0;
    if (evt.currentTarget.dataset.data.totallyPrice) {
      price = evt.currentTarget.dataset.data.totallyPrice;
    } else {
      price = evt.currentTarget.dataset.data.finalPrice;
    }
    this.setData({
      totalPrice: this.data.totalPrice += price
    });

  },
  addSpec: function () {

  },
  selectSpec: function (evt) {
    //重置所有active为false start
    var d = this.data.specList[evt.currentTarget.dataset.parentindex].specList;
    for (var i = 0; i < d.length; i++) {
      d[i].isActive = false;
    }
    var data1 = {};
    var key1 = "specList[" + evt.currentTarget.dataset.parentindex + "].specList";
    data1[key1] = d;
    this.setData(data1);
    //重置所有active为false end

    //将点击的置为active start
    var data = {};
    var key = "specList[" + evt.currentTarget.dataset.parentindex + "].specList[" + evt.currentTarget.dataset.childindex + "].isActive";
    data[key] = true;
    this.setData(data);

    //将点击的置为active end
    var data3 = {};
    var key3 = "cataItem.requestSpecList[" + evt.currentTarget.dataset.parentindex + "].specList";
    data3[key3] = [];
    data3[key3].push(evt.currentTarget.dataset.item);
    this.setData(data3);
    this.checkSpecPrice();

  },
  checkSpecPrice: function () {
    if (this.data.cataItem.requestSpecList.length == 0)
      return;
    var specPrice = 0;
    for (var i = 0; i < this.data.cataItem.requestSpecList.length; i++) {
      specPrice += this.data.cataItem.requestSpecList[i].specList[0].price;
    }
    var item = this.data.cataItem;
    item.totallyPrice = this.data.cataItem.finalPrice + specPrice;
    this.setData({
      cataItem: item
    })
  },
  addSpecIntoCart: function (evt) {
    var cartData = this.data.cataItem;
    var specPrice = 0;
    for (var i = 0; i < cartData.requestSpecList.length; i++) {
      specPrice += cartData.requestSpecList[i].specList[0].price;
    }
    cartData.totallyPrice = cartData.finalPrice + specPrice;
    this.baseAddItem(cartData);
    this.setData({
      isCataShow:false
    });
  },
  addItem: function (evt) {

    //如果有规格
    if (evt.currentTarget.dataset.data.relSpecList.length != 0) {
      var tData = evt.currentTarget.dataset.data;
      tData.requestSpecList = [];
      //为规格赋值
      var relSpecList = tData.relSpecList;
      for (var i = 0; i < relSpecList.length; i++) {
        for (var j = 0; j < relSpecList[i].specList.length; j++) {
          relSpecList[i].specList[j].isActive = false;
        }
        relSpecList[i].specList[0].isActive = true;
        tData.requestSpecList.push({
          parentCode: relSpecList[i].parentCode,
          parentName: relSpecList[i].parentName,
          specList: [relSpecList[i].specList[0]]
        });
      }
      this.setData({
        specList: relSpecList,
        isCataShow: true,
        cataItem: tData,
        animationData:customAnimation.opacityLinearIn(this,"animationData")
      });
      this.checkSpecPrice();
      return;
    }
    var cartData = evt.currentTarget.dataset.data;
    var specPrice = 0;
    for (var i = 0; i < cartData.requestSpecList.length; i++) {
      specPrice += cartData.requestSpecList[i].specList[0].price;
    }
    cartData.totallyPrice = cartData.finalPrice + specPrice;
    this.baseAddItem(cartData);

  },
  baseAddItem: function (cartData) {
      var ret = undefined;
      if (this.data.cartItems.length == 0) {
          ret = this.data.cartItems.concat([[cartData]]);
      } else {
          ret = this.data.cartItems;
          var flag = -1;
          var flag2 = -1;
          for (var i = 0; i < ret.length; i++) {
              for (var j = 0; j < ret[i].length; j++) {
                  var step1 = cartData.requestSpecList.length == ret[i][j].requestSpecList.length;
                  var step2 = false;
                  if (step1) {
                      if (cartData.requestSpecList.length == 0) {
                          step2 = true;
                      } else {
                          var boolArray = [];
                          for (var k = 0; k < cartData.requestSpecList.length; k++) {
                              if (cartData.requestSpecList[k].specList[0].code == ret[i][j].requestSpecList[k].specList[0].code) {
                                  boolArray.push(true);
                                  // step2 = true;
                              } else {
                                  boolArray.push(false);
                                  // step2 = false;
                              }
                          }

                          for (var z = 0; z < boolArray.length; z++) {
                              if (!boolArray[z]) {
                                  step2 = false;
                                  break;
                              } else {
                                  step2 = true;
                              }
                          }
                      }

                  }

                  if (ret[i][j].id == cartData.id && step1 && step2) {
                      flag = j;
                      flag2 = i;
                      break;
                  }
              }
          }
          if (flag == -1) {
              ret = ret.concat([[cartData]]);
          } else {
              ret[flag2].push(cartData);
          }

    }

    this.setData({
      cartItems: ret
    });
    var price = 0;
    if (cartData.totallyPrice) {
      price = cartData.totallyPrice;
    } else {
      price = cartData.finalPrice;
    }
    this.setData({
      totalPrice: utils.math.accAdd(this.data.totalPrice,price)
    });
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
  onClickLeftItem: function (target) {
    let that = this;
    if (that.data.timeoutFlag != undefined) {
      clearTimeout(that.data.timeoutFlag);
      that.data.timeoutFlag = undefined;
      return;
    }
    // this.cleanSelectLeft();
    // var data = {};
    // var key = "leftData[" + parseInt(target.currentTarget.dataset.index) + "].isActive";
    // data[key] = true;
    // this.setData(data);
    var toId = 'rightId' + this.data.leftData[target.currentTarget.dataset.index].toViewId;
    this.setData({
      scrollToViewId: toId
    });

  },
  listProducts: function (shopId) {
    var url = utils.BASE_URL + 'api/sp2/shop/listProducts';
    var that = this;
    wx.showLoading({
      mask: true
    });
    wx.request({
      url: url,
      method: 'get',
      data: { shopId: shopId },
      complete: function () {
        wx.hideLoading();
      },
      success: function (reponse) {
        if (reponse.data.code != 0)
          return;
        var orinData = reponse.data.data;
        var leftData = [];
        var rightData = [];
        for (var i = 0; i < orinData.length; i++) {
          var d = orinData[i].tagList[0];
          d.isActive = false;
          d.pic = utils.BASE_IMG_URL + d.pic;
          leftData.push(d);
          for (var j = 0; j < d.productList.length; j++) {
            var t = d.productList[j];
            t.isActive = false;
            t.pic = utils.BASE_IMG_URL + t.pic;
            rightData.push(t);
          }
          var count = rightData.length - 1;
          var toleft = rightData.length - d.productList.length;
          if (toleft<0){
            toleft = 0;
          }
          leftData[i].toViewId = toleft;
          that.data.rightScrollViewCount.push(count);
        }
        leftData[0].isActive = true;
        that.setData({
          leftData: leftData,
          rightData: rightData
        });
        for (let i = 0; i < that.data.rightScrollViewCount.length; i++) {
          let query = wx.createSelectorQuery();
          var index = that.data.rightScrollViewCount[i];
          query.select('#rightId' + index).boundingClientRect((rect) => {
            that.data.domQuery.push(rect);
          }).exec();
        }
      }
    });
  },
  onLoad: function (option) {
    this.listProducts(option.shopId);
  },
  onShow: function () {
    console.log("onShow app.globalData.cartItems",app.globalData.cartItems);
    this.setData({
      cartItems: app.globalData.cartItems,
       totalPrice: app.globalData.totalPrice
    })
  },
  onReady: function () {
    
  }
})

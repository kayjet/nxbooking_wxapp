const opacityLinearIn = function (that, fieldName) {
    let animation = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
        delay: 0,
    });
    animation.opacity(0).step();
    setTimeout(function () {
        let obj = new Object();
        animation.opacity(1).step();
        obj[fieldName] = animation.export();
        that.setData(obj);
    }, 0);
    return animation.export();
};

const opacityLinearOut = function (that, fieldName) {
    let animation = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
        delay: 0,
    });
    animation.opacity(1).step();
    setTimeout(function () {
        let obj = new Object();
        animation.opacity(0).step();
        obj[fieldName] = animation.export();
        that.setData(obj);
    }, 0);
    return animation.export();
};
module.exports = {
    opacityLinearIn: opacityLinearIn,
    opacityLinearOut: opacityLinearOut
};

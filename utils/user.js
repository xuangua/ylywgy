class user {
  /**
   * 检测是否登录 无操作
   */
  ckLogin() {
    try {
      let AuthToken = wx.getStorageSync('AuthToken')
      if (AuthToken) {
        return AuthToken
      } else {
        throw false;
      }
    } catch (e) {
      return false
    }
  }
  /**
   * 检测用户是否登录，未登录进行登录操作
   */
  isLogin(cb) {
    try {
      let userInfo = wx.getStorageSync('UserInfo')
      let authToken = wx.getStorageSync('AuthToken')
      if (authToken) {
        typeof cb == "function" && cb(authToken, userInfo)
      } else {
        throw false;
      }
    } catch (e) {
      this.getUser((authToken, userInfo) => {
        typeof cb == "function" && cb(authToken, userInfo)
      })
    }
  }

  getUser(cb) {
    var that = this
    this.getUserInfo(function (info, code) {
      that.goLogin(code, info, function (token, userInfo) {
        typeof cb == "function" && cb(token, userInfo)
      });
    });
  }

  goLogin(code, res, cb) {
    wx.showNavigationBarLoading()
    wx.request({
      url: getApp().api.v3_login_with_user_info,
      data: {
        code: code,
        encryptedData: res.encryptedData,
        iv: res.iv
      },
      header: {
        'content-type' : 'application/json',
        'Cookie'       : "sid=" + res.sid
      },
      method: 'POST',
      success: function (re) {
        console.log(re.data)
        if (re.statusCode == 200) {
          wx.setStorageSync('UserInfo', re.data.data.data)
          wx.setStorageSync('AuthToken', re.data.data.token)
          typeof cb == "function" && cb(re.data.data.token, re.data.data.data)
        } else {
          wx.showModal({
            content: '登录失败',
          })
        }
      },
      complete: function () {
        wx.hideNavigationBarLoading();
        wx.hideLoading();
      }
    })
  }
  /**
   * 获取微信用户信息
   */
  getUserInfo(cb) {
    var that = this
    var resData = {};
    var jsCodeDone, userInfoDone;

    console.log("getUserInfo")
    //调用登录接口
    wx.login({
      success: function (res) {
        if (res.code) {
          var code = res.code;
          wx.request({
            url: getApp().api.login,
            data: {
              code: res.code
            },
            success: function(res) {
              resData.sid = res.data.data.sid;
              jsCodeDone = true;
              if (jsCodeDone && userInfoDone) {
                typeof cb == "function" && cb(resData, code)
                // setUserInfo();
              }
            }
          });

          wx.getUserInfo({
            success: function(res) {
                resData.userInfo      = res.userInfo;
                resData.encryptedData = res.encryptedData;
                resData.iv            = res.iv;
                userInfoDone          = true;
                if (jsCodeDone && userInfoDone) {
                  typeof cb == "function" && cb(resData, code)
                  // setUserInfo();
                }
            },
            // fail: function(data) {
            //     console.log(data);
            // }
            // success: function (res) {
            //   typeof cb == "function" && cb(res, code)
            // },
            fail: function (res) {
              wx.showModal({
                content: '您拒绝了用户授权，如需重新授权，请到个人中心点击立即登录按钮授权！',
                success: function (res) {
                  if (res.confirm) {
                    wx.switchTab({
                      url: '/pages/user/user',
                    })
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
          })
        }
      }
    })
    // wx.login({
    //   success: function(res) {
    //     // var code = res.code;
    //     if (res.code) {
    //       wx.request({
    //           url: getApp().api.login,
    //           data: {
    //               code: res.code
    //           },
    //           success: function(res) {
    //               resData.sid = res.data.data.sid;
    //               jsCodeDone = true;
    //               jsCodeDone && userInfoDone && setUserInfo();
    //           }
    //       });

    //       wx.getUserInfo({
    //           success: function(res) {
    //               resData.userInfo      = res.userInfo;
    //               resData.encryptedData = res.encryptedData;
    //               resData.iv            = res.iv;
    //               userInfoDone          = true;
    //               jsCodeDone && userInfoDone && setUserInfo();
    //           },
    //           fail: function(data) {
    //               console.log(data);
    //           }
    //       });
    //     }
    //   }
    // });
  }
}
module.exports = user;
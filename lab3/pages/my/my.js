var common = require('../../utils/common.js')
// pages/my/my.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLogin:false,
    src:'../../images/my.png',
    nickName:'User',
    newsList:[],
    number:0
  },
// 获取个人信息
  getUserInfo(){
    let that = this
    wx.getUserProfile({
      desc: 'desc',
      success(res){
          console.log(res.userInfo)//这里可以在控制台输出用户信息
          res = res.userInfo
            that.setData({
                isLogin : true,
                src : res.avatarUrl,//设置用户头像
                nickName : res.nickName//设置用户昵称
            })
      }
    })
  },
  //更新number
  getMyFavorites:function(){
    let info = wx.getStorageInfoSync()  //读取本地缓存信息
    let keys = info.keys    //获取全部key信息

    let myList = [];
    for( var i = 0; i < keys.length; i++ ){
      let obj = wx.getStorageSync(keys[i])
      //缓存中可能混有系统写入的非新闻数据，只保留真正的新闻收藏
      if( obj && obj.id && obj.title ){
        myList.push(obj)
      }
    }
    //更新收藏列表
    this.setData({
      newsList:myList,
      number:myList.length
    })
  },
  goToDetail: function (e) {
    //获取携带data-id的数据
    let id = e.currentTarget.dataset.id
    //console.log(e)
    //携带新闻ID进行页面跳转
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if( this.data.isLogin ){
      this.getMyFavorites()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
var common = require('../../utils/common.js')
// 微信官方匿名头像（灰色默认头像）
const ANONYMOUS_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
// pages/my/my.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLogin:false,
    src:'../../images/my.png',
    nickName:'',
    newsList:[],
    number:0,
    historyList:[],//浏览历史列表
    showLoginPopup:false,//是否显示登录弹窗
    loginMode:'choose'//弹窗内容：choose-选择登录方式 fill-填写真实头像昵称
  },
  // 点击登录按钮：弹出登录方式选择
  handleLogin(){
    this.setData({
      showLoginPopup : true,
      loginMode : 'choose'
    })
  },
  // 选择「使用微信账号头像昵称」
  useRealInfo(){
    let that = this
    // 老端兜底：低版本基础库/旧版微信上仍可能返回真实信息
    // 新客户端（基础库 2.27.1+）一律返回匿名信息，将进入官方填写流程
    wx.getUserProfile({
      desc: '用于展示登录头像昵称',
      success(res){
        let info = res.userInfo
        // 拿到的是匿名信息（灰色头像 + "微信用户"），改用官方填写能力
        if( !info || !info.nickName || info.nickName === '微信用户' ){
          that.setData({
            loginMode : 'fill'
          })
          return
        }
        that.doLogin(info.avatarUrl, info.nickName)//保存登录状态并登录
      },
      fail(){
        // 未授权或隐私协议拦截：进入官方填写流程
        that.setData({
          loginMode : 'fill'
        })
      }
    })
  },
  // 选择「使用匿名头像昵称」：一键匿名登录，使用微信官方匿名头像昵称
  useAnonymous(){
    this.doLogin(ANONYMOUS_AVATAR, '微信用户')
  },
  // 填写面板：选择头像（官方 chooseAvatar 能力，真机可选微信头像）
  onChooseAvatar(e){
    this.setData({
      src : e.detail.avatarUrl//设置用户头像
    })
  },
  // 填写面板：填写昵称（官方 nickname 输入框，可快捷填充微信昵称）
  onNicknameInput(e){
    this.setData({
      nickName : e.detail.value//设置用户昵称
    })
  },
  // 填写面板：确认登录，同时写入头像和昵称
  confirmRealInfo(){
    if( !this.data.nickName ){
      wx.showToast({
        title: '请先填写昵称',
        icon: 'none'
      })
      return
    }
    this.doLogin(this.data.src, this.data.nickName)
  },
  // 登录成功：写入登录状态与当前用户信息（收藏按用户 id 保存）
  doLogin(avatarUrl, nickName){
    let userId = nickName//本实验无后端，用昵称作为用户 id（匿名账号共用"微信用户"空间）
    wx.setStorageSync('currentUser', { id: userId, nickName: nickName, avatarUrl: avatarUrl })
    this.setData({
      isLogin : true,
      src : avatarUrl,//设置用户头像
      nickName : nickName,//设置用户昵称
      showLoginPopup : false,
      newsList : [],
      number : 0,
      historyList : []
    })
    this.getMyFavorites()
    this.getMyHistory()
  },
  // 注销登录：清除登录状态和当前用户信息
  logout(){
    wx.removeStorageSync('currentUser')
    this.setData({
      isLogin : false,
      src : '../../images/my.png',
      nickName : '',
      showLoginPopup : false,
      newsList : [],
      number : 0,
      historyList : []
    })
  },
  // 切换账号：注销后立即弹出登录面板
  switchAccount(){
    this.logout()
    this.setData({
      showLoginPopup : true,
      loginMode : 'choose'
    })
  },
  // 关闭登录弹窗（点击遮罩）
  closeLoginPopup(){
    this.setData({
      showLoginPopup : false
    })
  },
  // 阻止弹窗内部点击冒泡到遮罩
  noop(){},
  //更新收藏列表：读取当前用户（按用户 id）的收藏
  getMyFavorites:function(){
    let userId = common.getCurrentUserId()//当前用户 id
    let myList = common.getFavorites(userId)//该用户的收藏列表
    //更新收藏列表
    this.setData({
      newsList:myList,
      number:myList.length
    })
  },
  //更新浏览历史：读取当前用户（按用户 id）的浏览历史
  getMyHistory:function(){
    let userId = common.getCurrentUserId()
    let historyList = common.getHistory(userId)
    this.setData({
      historyList: historyList
    })
  },
  //清空浏览历史
  clearHistory:function(){
    let userId = common.getCurrentUserId()
    common.clearHistory(userId)
    this.setData({
      historyList: []
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
    //恢复登录状态：上次登录的用户信息已按用户 id 存入本地缓存
    let user = wx.getStorageSync('currentUser')
    if( user && user.id ){
      this.setData({
        isLogin : true,
        src : user.avatarUrl,
        nickName : user.nickName
      })
    }
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
      this.getMyHistory()
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
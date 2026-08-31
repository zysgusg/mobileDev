var common = require('../../utils/common.js') //引用公共JS文件
var util = require('../../utils/util.js') //时间格式化
// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAdd: false,//是否已收藏
    isLiked: false,//是否已点赞
    likeCount: 0,//点赞数
    comments: [],//评论列表
    commentText: '',//评论输入内容
    article: {}
  },
  // 登录检查：未登录时提示并引导跳转登录页，返回 false 表示未登录
  checkLogin:function(){
    let userId = common.getCurrentUserId()
    if( userId !== 'guest' ){
      return true//已登录
    }
    //未登录：提示并引导去登录
    wx.showModal({
      title: '提示',
      content: '登录后可进行该操作',
      confirmText: '去登录',
      success(res){
        if( res.confirm ){
          wx.switchTab({
            url: '/pages/my/my'//跳转"我的"页进行登录
          })
        }
      }
    })
    return false
  },
  addFavorites:function(){
    if( !this.checkLogin() ){return}//未登录拦截
    let article = this.data.article
    let userId = common.getCurrentUserId()//当前用户 id
    let list = common.getFavorites(userId)//该用户的收藏列表
    //避免重复收藏
    if( !list.some(item => item.id == article.id) ){
      list.push(article)
      common.saveFavorites(userId, list)//按用户 id 保存收藏
    }
    this.setData({
      isAdd:true
    })
  },
  //取消收藏
  cancelFavorites:function(){
    let article = this.data.article
    let userId = common.getCurrentUserId()
    let list = common.getFavorites(userId).filter(item => item.id != article.id)
    common.saveFavorites(userId, list)//按用户 id 保存收藏
    this.setData({
      isAdd:false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let id = options.id

    //检查当前新闻是否在当前用户的收藏夹中
    let userId = common.getCurrentUserId()//当前用户 id
    let myList = common.getFavorites(userId)//该用户的收藏列表
    let exist = myList.filter(item => item.id == id)
    //已存在
    if( exist.length > 0 ){
      this.setData({
        isAdd:true,
        article:exist[0]
      })
    }
    //不存在
    else{
      let result = common.getNewsDetail(id)
      //获取新闻内容
      if( result.code == '200' ){
        this.setData({
          article:result.news,
          isAdd:false
        })
      }
    }
    this.initLike()//初始化点赞状态
    this.recordHistory()//记录浏览历史
    this.loadComments()//加载评论
  },
  // 初始化点赞状态：本人是否点过赞 + 全网点赞总数（其他用户的点赞也计入）
  initLike:function(){
    let userId = common.getCurrentUserId()
    let likes = common.getLikes(userId)
    let isLiked = likes.indexOf(this.data.article.id) > -1
    this.setData({
      isLiked : isLiked,
      likeCount : common.getLikeCount(this.data.article.id)//全局点赞总数
    })
  },
  // 点赞 / 取消点赞：本人状态按用户保存，总数全局累加
  toggleLike:function(){
    if( !this.checkLogin() ){return}//未登录拦截
    let articleId = this.data.article.id
    let userId = common.getCurrentUserId()
    let likes = common.getLikes(userId)
    let isLiked = !this.data.isLiked
    if( isLiked ){
      likes.push(articleId)
      common.setLikeCount(articleId, common.getLikeCount(articleId) + 1)//全局 +1
    }else{
      likes = likes.filter(id => id != articleId)
      common.setLikeCount(articleId, Math.max(0, common.getLikeCount(articleId) - 1))//全局 -1（不低于0）
    }
    common.saveLikes(userId, likes)
    this.setData({
      isLiked : isLiked,
      likeCount : common.getLikeCount(articleId)
    })
  },
  // 记录浏览历史（按用户 id 保存，最多20条）
  recordHistory:function(){
    let article = this.data.article
    if( !article || !article.id ){
      return//新闻不存在时不记录
    }
    let userId = common.getCurrentUserId()
    let time = util.formatTime(new Date())//浏览时间
    common.addHistory(userId, {
      id : article.id,
      title : article.title,
      poster : article.poster,
      add_date : article.add_date,
      time : time
    })
  },
  // 加载当前新闻的评论
  loadComments:function(){
    this.setData({
      comments: common.getComments(this.data.article.id)
    })
  },
  // 评论输入
  onCommentInput:function(e){
    this.setData({
      commentText: e.detail.value
    })
  },
  // 发表评论：未登录以游客身份发表
  submitComment:function(){
    if( !this.checkLogin() ){return}//未登录拦截
    let content = this.data.commentText.trim()
    if( !content ){
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      })
      return
    }
    let user = common.getCurrentUser()//当前用户（未登录为游客）
    let comment = {
      id: Date.now(),
      nickName: user.nickName,
      avatarUrl: user.avatarUrl,
      content: content,
      time: util.formatTime(new Date())//评论时间
    }
    common.addComment(this.data.article.id, comment)
    this.setData({
      commentText: ''//清空输入框
    })
    this.loadComments()//刷新评论列表
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
// pages/index/index.js
var common = require('../../utils/common.js') //引用公共JS文件
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //幻灯片素材（id与common.js中的新闻id对应）
    swiperImg: [
      {id: '264698', src: 'https://gaopursuit.oss-cn-beijing.aliyuncs.com/2022/newsimage1.jpg'},
      {id: '304083', src: 'https://gaopursuit.oss-cn-beijing.aliyuncs.com/2022/newsimage2.jpg'},
      {id: '305670', src: 'https://gaopursuit.oss-cn-beijing.aliyuncs.com/2022/newsimage3.jpg'}
    ],
    keyword:'',//搜索关键字
    allNews:[],//全部新闻（用于搜索过滤）
  },

  /**
   * 自定义函数--跳转新页面浏览新闻内容
   */
  goToDetail: function(e) {
    //获取携带的data-id数据
    let id = e.currentTarget.dataset.id;
    //携带新闻id进行页面跳转
    wx.navigateTo({
      url: '../detail/detail?id=' + id
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取新闻列表
    let list = common.getNewsList()
    //更新列表数据
    this.setData({
      newsList: list,
      allNews: list//保存全部新闻，供搜索过滤
    })
  },
  // 搜索：按标题/正文关键字实时过滤新闻列表
  onSearchInput: function(e) {
    let keyword = e.detail.value.trim()
    let list = this.data.allNews
    if( keyword ){
      //匹配标题或正文，忽略大小写（列表项可能不含 content，需判空）
      list = list.filter(news => {
        let title = (news.title || '').toLowerCase()
        let content = (news.content || '').toLowerCase()
        let word = keyword.toLowerCase()
        return title.indexOf(word) > -1 || content.indexOf(word) > -1
      })
    }
    this.setData({
      newsList: list,
      keyword: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
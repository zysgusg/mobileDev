//模拟新闻数据
const news = [
  {id: '264698',
  likes: 0,//基础点赞数
  title: '省退役军人事务厅来校交流对接工作',
  poster: 'https://gaopursuit.oss-cn-beijing.aliyuncs.com/2022/newsimage1.jpg',
  content: ' 8月19日，省退役军人事务厅二级巡视员蔡元和、办公室主任刘恒贵、就业创业处副处长钟俊武一行来校就联合共建安徽退役军人学院事宜进行交流对接。校党委常委、副校长陆林，芜湖市退役军人事务局党组成员、副局长张桂芬，学校办公室、人事处、教务处、招就处、学生处、研究生院、体育学院负责同志参加会议。',
  add_date: '2022-08-19'},
  {id: '304083',
  likes: 0,//基础点赞数
  title: '《光明日报》刊发我校研究员王顺理论文章《不断提高理论素养》',
  poster: 'https://gaopursuit.oss-cn-beijing.aliyuncs.com/2022/newsimage2.jpg',
  content: ' 8月9日，《光明日报》第06版“学习贯彻习近平新时代中国特色社会主义思想专刊”版面长篇幅刊发了我校中国特色社会主义理论体系研究中心特约研究员、马克思主义学院博士生王顺题为《不断提高理论素养》的理论文章。文章从“理论素养坚实，才能理想信念坚定”“克服前进道路上的各种困难，需要具备扎实的理论素养”“提升理论素养，必须学懂弄通做实党的创新理论”3个方面全面阐述了不断提高理论素养、坚持用党的创新理论武装头脑的重要性。文章指出，新征程上，面对具有新的历史特点的伟大斗争，迫切需要我们学懂弄通做实党的创新理论，以扎实的理论素养提升战略定力、斗争能力，从而不断取得新的伟大胜利。',
  add_date: '2022-08-09'},
  {id: '305670',
  likes: 0,//基础点赞数
  title: '我校在第八届安徽省”互联网+”大学生创新创业大赛再创佳绩',
  poster: 'https://gaopursuit.oss-cn-beijing.aliyuncs.com/2022/newsimage3.jpg',
  content: '7月4日—8月10日，由安徽省教育厅、合肥市人民政府、淮北市人民政府联合主办的第八届安徽省“互联网+”大学生创新创业大赛暨中国国际“互联网+”大学生创新创业大赛选拔赛在线上举办。我校参赛项目团队历经省级复赛网评、决赛路演答辩、金奖排位赛等多轮次比拼，斩获金奖3项、银奖10项、铜奖23项，其中3个项目由省赛组委会推荐入围国赛。',
  add_date: '2022-08-11'}
];

//获取新闻列表
function getNewsList() {
  let list = [];
  for (var i = 0; i < news.length; i++) {
    let obj = {};
    obj.id = news[i].id;
    obj.poster = news[i].poster;
    obj.add_date = news[i].add_date;
    obj.title = news[i].title;
    obj.content = news[i].content; //供搜索匹配正文
    list.push(obj);
  }
  return list; //返回新闻列表
}

//获取新闻内容
function getNewsDetail(newsID) {
  let msg = {
    code: '404', //没有对应的新闻
    news: {}
  };
  for (var i = 0; i < news.length; i++) {
    if (newsID == news[i].id) { //匹配新闻id编号
      msg.code = '200'; //成功
      msg.news = news[i]; //更新当前新闻内容
      break;
    }
  }
  return msg; //返回查找结果
}

// 收藏相关：收藏列表按用户 id 保存，key 为 favorites_<userId>
// 获取当前登录用户 id（未登录时为 guest）
function getCurrentUserId() {
  let user = wx.getStorageSync('currentUser')
  return (user && user.id) ? user.id : 'guest'
}

// 获取某用户的收藏列表
function getFavorites(userId) {
  return wx.getStorageSync('favorites_' + userId) || []
}

// 保存某用户的收藏列表
function saveFavorites(userId, list) {
  wx.setStorageSync('favorites_' + userId, list)
}

// 点赞：likes_<userId> 存该用户点赞的新闻 id 数组（记录"本人是否点过"，保证不重复计数）
function getLikes(userId) {
  return wx.getStorageSync('likes_' + userId) || []
}

// 保存某用户的点赞列表
function saveLikes(userId, list) {
  wx.setStorageSync('likes_' + userId, list)
}

// 点赞计数：likeCount_<newsId> 存该新闻的点赞总数（全局可见，其他用户的点赞也计入）
function getLikeCount(newsId) {
  return wx.getStorageSync('likeCount_' + newsId) || 0
}

// 更新某新闻的点赞总数
function setLikeCount(newsId, count) {
  wx.setStorageSync('likeCount_' + newsId, count)
}

// 浏览历史：history_<userId> 存最近浏览的新闻（新→旧，最多20条）
function getHistory(userId) {
  return wx.getStorageSync('history_' + userId) || []
}

// 添加一条浏览历史（同一条新闻去重，只保留最近一次浏览）
function addHistory(userId, article) {
  let list = getHistory(userId)
  list = list.filter(item => item.id != article.id)
  list.unshift(article)
  if (list.length > 20) {
    list = list.slice(0, 20)
  }
  wx.setStorageSync('history_' + userId, list)
}

// 清空某用户的浏览历史
function clearHistory(userId) {
  wx.removeStorageSync('history_' + userId)
}

// 评论：comments_<newsId> 存某条新闻的评论列表（评论是公共内容，所有用户可见）
function getComments(newsId) {
  return wx.getStorageSync('comments_' + newsId) || []
}

// 添加一条评论（新→旧，最多50条）
function addComment(newsId, comment) {
  let list = getComments(newsId)
  list.unshift(comment)
  if (list.length > 50) {
    list = list.slice(0, 50)
  }
  wx.setStorageSync('comments_' + newsId, list)
}

// 获取当前用户信息（未登录返回游客身份）
function getCurrentUser() {
  let user = wx.getStorageSync('currentUser')
  if( user && user.id ){
    return {
      nickName: user.nickName,
      avatarUrl: user.avatarUrl
    }
  }
  return {
    nickName: '游客',
    avatarUrl: ''
  }
}

// 对外暴露接口
module.exports = {
  getNewsList: getNewsList,
  getNewsDetail: getNewsDetail,
  getCurrentUserId: getCurrentUserId,
  getFavorites: getFavorites,
  saveFavorites: saveFavorites,
  getLikes: getLikes,
  saveLikes: saveLikes,
  getLikeCount: getLikeCount,
  setLikeCount: setLikeCount,
  getHistory: getHistory,
  addHistory: addHistory,
  clearHistory: clearHistory,
  getComments: getComments,
  addComment: addComment,
  getCurrentUser: getCurrentUser
}
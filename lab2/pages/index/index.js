// index.js
Page({
onShareAppMessage: function () {
  return {
    title: '分享给朋友', 
    path: '/pages/index/index?id=123', 
    imageUrl: '/images/share.jpg'
  };
},
onShareTimeline: function () {
  return {
    title: '分享到朋友圈', 
    query: 'from=timeline',
    imageUrl: '/images/timeline.jpg'
  };
}
})

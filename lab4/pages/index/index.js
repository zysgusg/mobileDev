// index.js
Page({
  // 页面的初始数据
  data: {
    levels: [
      'level01.png',
      'level02.png',
      'level03.png',
      'level04.png'
    ]
  },
  // 自定义函数--游戏选关
  chooseLevel: function (e) {
    let level = e.currentTarget.dataset.level
    wx.navigateTo({
      url: '/pages/game/game?level=' + level
    })
  }
})

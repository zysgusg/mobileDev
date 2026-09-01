// game.js
var data = require('../../utils/data.js')  // 引用公共JS文件

// 地图图层数据
var map = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
]

// 箱子图层数据
var box = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
]

// 移动历史记录，用于"回退一步"
var history = []

// 初始化游戏主角(小鸟)的行与列
var row = 0
var col = 0

Page({
  data: {
    level: 1,
    // 计步器
    steps: 0,
    // 本关最佳记录（0 表示暂无记录，界面显示为 "--"）
    best: 0,
    // 画布尺寸(px)与单个方块尺寸(px)，根据屏幕自适应
    canvasSize: 260,
    cellSize: 32.5,
    // 方向键与底部操作按钮的动态尺寸
    btnSize: 84,
    btnFont: 40,
    actionH: 40,
    actionFont: 17
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    // 获取关卡并更新页面关卡标题
    let level = parseInt(options.level) + 1
    // 读取本关的最佳记录
    let best = wx.getStorageSync('sokoban_best') || {}
    this.setData({
      level: level,
      best: best[level] || 0
    })
    // 计算响应式画布与按钮尺寸，保证页面内容不超出屏幕
    this.calcLayout()
    // 创建画布上下文
    this.ctx = wx.createCanvasContext('myCanvas')
    // 初始化地图数据
    this.initMap(options.level)
    // 绘制画布内容
    this.drawCanvas()
  },

  // 自定义函数--计算响应式画布与按钮尺寸
  calcLayout: function () {
    // 获取屏幕尺寸
    var sysInfo = wx.getSystemInfoSync()
    var winW = sysInfo.windowWidth
    var winH = sysInfo.windowHeight
    // 方向键边长：约为原来的两倍，随屏宽缩放，限制在 72~92px
    var btn = Math.round(winW * 0.23)
    if (btn > 92) btn = 92
    if (btn < 72) btn = 72
    // 方向键字号
    var btnFont = Math.round(btn * 0.48)
    // 底部操作按钮高度与字号（不做放大，避免与方向键混淆）
    var actionH = Math.round(winW * 0.11)
    if (actionH > 46) actionH = 46
    if (actionH < 36) actionH = 36
    var actionFont = Math.round(actionH * 0.42)
    // 预估顶部标题区域高度
    var headerH = 64
    // 预估方向键区域高度：两行按钮(每行按钮高+上下间距)
    var btnBoxH = 2 * (btn + 10) + 4
    // 方向键与底部按钮之间的间距，避免误触"重新开始"
    var actionGap = 30
    // 预估底部操作行高度与上边距
    var actionRowH = actionH + 6
    // 上下内边距
    var padH = 16
    // 预留高度的总和，并额外保留 30px 安全余量，确保控件不被挤出屏幕
    var reserve = headerH + btnBoxH + actionGap + actionRowH + padH + 30
    // 计算画布可用宽度与高度（再减去画布白色衬底与区域的内边距）
    var availW = winW - 40
    var availH = winH - reserve - 20
    var size = Math.floor(Math.min(availW, availH))
    // 设置合理的最小/最大尺寸
    if (size > 260) size = 260
    if (size < 150) size = 150
    this.setData({
      canvasSize: size,
      cellSize: size / 8,
      btnSize: btn,
      btnFont: btnFont,
      actionH: actionH,
      actionFont: actionFont
    })
  },

  // 自定义函数--初始化地图数据
  initMap: function (level) {
    // 读取初始的游戏地图数据
    let mapData = data.maps[level]
    // 使用双重for循环记录地图数据
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        box[i][j] = mapData[i][j]
        map[i][j] = mapData[i][j]
        if (mapData[i][j] == 4) {
          box[i][j] = 4
          map[i][j] = 2
        } else if (mapData[i][j] == 5) {
          map[i][j] = 2
          // 记录小鸟的当前行和列
          row = i
          col = j
        }
      }
    }
  },

  // 自定义函数--绘制地图
  drawCanvas: function () {
    let ctx = this.ctx
    let size = this.data.canvasSize
    let w = this.data.cellSize
    // 清空画布
    ctx.clearRect(0, 0, size, size)
    // 使用双重for循环绘制8x8的地图
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        // 8*8 深浅交替的蓝色方格作为地图背景（浅蓝与页面背景颜色一致）
        ctx.setFillStyle((i + j) % 2 === 0 ? '#6aa5f0' : '#4276c2')
        ctx.fillRect(j * w, i * w, w, w)
        // 石头（墙）
        if (map[i][j] == 1) {
          ctx.drawImage('/images/icons/stone.png', j * w, i * w, w, w)
        } else if (map[i][j] == 3) {
          // 终点
          ctx.drawImage('/images/icons/pig.png', j * w, i * w, w, w)
        } else if (map[i][j] == 6) {
          // 特殊格子（ice）：穿过时移动两格
          ctx.drawImage('/images/icons/ice.png', j * w, i * w, w, w)
        }
        // 箱子
        if (box[i][j] == 4) {
          ctx.drawImage('/images/icons/box.png', j * w, i * w, w, w)
        }
      }
    }
    // 绘制小鸟
    ctx.drawImage('/images/icons/bird.png', col * w, row * w, w, w)
    // 地图边界：用深蓝色细线划出
    ctx.setStrokeStyle('#2f5a94')
    ctx.setLineWidth(2)
    ctx.strokeRect(0, 0, size, size)
    ctx.draw()
  },

  // 自定义函数--统一处理移动（含 ice 特殊格子滑行两格）
  move: function (dr, dc) {
    // 记录当前状态用于回退
    var snapshot = { row: row, col: col, box: box.map(function (r) { return r.slice() }) }
    var moved = false
    var r1 = row + dr
    var c1 = col + dc
    // 目标格在界内
    if (r1 >= 0 && r1 < 8 && c1 >= 0 && c1 < 8) {
      if (map[r1][c1] == 1) {
        // 前方是墙，无法移动
      } else if (box[r1][c1] == 4) {
        // 前方是箱子，尝试推动
        var r2 = r1 + dr
        var c2 = c1 + dc
        if (r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8 && map[r2][c2] != 1 && box[r2][c2] != 4) {
          // 箱子从 (r1,c1) 推到 (r2,c2)
          box[r1][c1] = 0
          box[r2][c2] = 4
          if (map[r2][c2] == 6) {
            // 箱子落入 ice 特殊格子，若下一格无阻挡则箱子继续滑行一格（共两格）
            var r3 = r2 + dr
            var c3 = c2 + dc
            if (r3 >= 0 && r3 < 8 && c3 >= 0 && c3 < 8 && map[r3][c3] != 1 && box[r3][c3] != 4) {
              box[r2][c2] = 0
              box[r3][c3] = 4
              // 箱子滑行两格，小鸟只移动一格到箱子原位置
              row = r1
              col = c1
            } else {
              // 第二格被阻挡，箱子停在第一格，小鸟只移动一格
              row = r1
              col = c1
            }
          } else {
            // 普通推动，小鸟移到 (r1,c1)
            row = r1
            col = c1
          }
          moved = true
        }
      } else {
        // 前方无阻挡，小鸟移动；若落入 ice 特殊格子且下一格无阻挡则滑行两格
        if (map[r1][c1] == 6) {
          var r2 = r1 + dr
          var c2 = c1 + dc
          if (r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8 && map[r2][c2] != 1 && box[r2][c2] != 4) {
            row = r2
            col = c2
          } else {
            // 第二格被阻挡，停在第一格
            row = r1
            col = c1
          }
        } else {
          row = r1
          col = c1
        }
        moved = true
      }
    }
    // 移动有效时才记录历史，并累加计步器
    if (moved) {
      history.push(snapshot)
      if (history.length > 200) history.shift()
      this.setData({ steps: this.data.steps + 1 })
    }
    // 重新绘制地图
    this.drawCanvas()
    // 检查游戏是否成功
    this.checkWin()
  },

  // 自定义函数--方向键：上
  up: function () { this.move(-1, 0) },
  // 自定义函数--方向键：下
  down: function () { this.move(1, 0) },
  // 自定义函数--方向键：左
  left: function () { this.move(0, -1) },
  // 自定义函数--方向键：右
  right: function () { this.move(0, 1) },

  // 自定义函数--回退一步
  undo: function () {
    if (history.length > 0) {
      // 弹出上一步的状态并恢复
      let last = history.pop()
      row = last.row
      col = last.col
      box = last.box
      // 计步器减一
      this.setData({ steps: this.data.steps - 1 })
      // 重新绘制地图
      this.drawCanvas()
    }
  },

  // 自定义函数--判断游戏是否成功
  isWin: function () {
    // 使用双重for循环遍历整个地图
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        // 如果有箱子没在终点
        if (box[i][j] == 4 && map[i][j] != 3) {
          // 返回false，表示游戏尚未成功
          return false
        }
      }
    }
    // 返回true，表示游戏成功
    return true
  },

  // 自定义函数--游戏成功处理
  checkWin: function () {
    if (!this.isWin()) return
    // 记录当前关卡号（1 开始）
    var curLevel = this.data.level
    var total = data.maps.length
    // 更新本关最佳记录（取更少步数）
    var best = wx.getStorageSync('sokoban_best') || {}
    if (!best[curLevel] || this.data.steps < best[curLevel]) {
      best[curLevel] = this.data.steps
      wx.setStorageSync('sokoban_best', best)
      this.setData({ best: this.data.steps })
    }
    if (curLevel < total) {
      // 还有下一关，提示后自动跳转到下一关
      wx.showModal({
        title: '恭喜',
        content: '第 ' + curLevel + ' 关通关！',
        showCancel: false,
        confirmText: '下一关',
        success: function () {
          wx.redirectTo({
            url: '/pages/game/game?level=' + curLevel
          })
        }
      })
    } else {
      // 已是最后一关
      wx.showModal({
        title: '恭喜',
        content: '恭喜你完成了全部关卡！',
        showCancel: false,
        confirmText: '返回首页',
        success: function () {
          wx.navigateBack()
        }
      })
    }
  },

  // 自定义函数--重新开始游戏
  restartGame: function () {
    // 清空历史记录并重置计步器
    history = []
    this.setData({ steps: 0 })
    // 初始化地图数据
    this.initMap(this.data.level - 1)
    // 绘制画布内容
    this.drawCanvas()
  }
})

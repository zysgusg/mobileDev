<center>姓名：周洋迅  学号：24020007175</center>

| 姓名和学号？         | 周洋迅，24020007175                                          |
| -------------------- | ------------------------------------------------------------ |
| 本实验属于哪门课程？ | 中国海洋大学26夏《移动软件开发》                             |
| 实验名称？           | 实验3：高校新闻网                                            |
| 博客地址？           | https://blog.csdn.net/2401_85763240/article/details/164212309 |
| 代码仓库地址？       | https://github.com/zysgusg/mobileDev                         |

## 一、实验内容

本次实验基于模拟数据实现一个简易的高校新闻小程序，综合运用前面实验学到的视图与逻辑知识。项目共三个页面：首页（新闻列表）、新闻详情页（全文阅读与收藏）、个人中心页（登录与收藏夹），其中首页和个人中心以 tabBar 形式切换。实验提供 `common.js` 模拟数据文件、图片素材以及首页部分代码，新闻页与个人中心页的视图和逻辑需要自己完成。

### 1. 项目创建与全局配置（`app.json`）

新建空白项目后，在 `app.json` 中注册 `detail` 和 `my` 两个页面，并配置导航栏与 tabBar。导航栏采用海大蓝 `#328EEB`，标题为"OUC新闻网"；tabBar 包含"首页"和"我的"两个 tab，切换时图标会变为蓝色选中态：

```json
"window": {
  "navigationBarTextStyle": "white",
  "navigationBarTitleText": "OUC新闻网",
  "navigationBarBackgroundColor": "#328EEB"
},
"tabBar": {
  "color": "#000000",
  "selectedColor": "#328EEB",
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "首页",
      "iconPath": "images/index.png",
      "selectedIconPath": "images/index_blue.png"
    },
    {
      "pagePath": "pages/my/my",
      "text": "我的",
      "iconPath": "images/my.png",
      "selectedIconPath": "images/my_blue.png"
    }
  ]
}
```

### 2. 首页设计（`index`）

首页由上下两部分组成：顶部 `<swiper>` 幻灯片（3 幅图片自动轮播，`indicator-dots` 显示指示点、`interval` 控制间隔；图片用 `mode="aspectFill"` 铺满并加了圆角与阴影），下方新闻列表通过 `wx:for` 遍历 `newsList` 渲染。每条新闻以卡片形式展示海报图、标题（超长时两行省略）和日期，点击跳转到详情页：

```xml
<!--幻灯片滚动-->
<view class="swiper-wrap">
  <swiper class="banner" indicator-dots="true" autoplay="true" interval="5000" duration="500"
    indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#ffffff">
    <block wx:for="{{swiperImg}}" wx:key='swiper{{index}}'>
      <swiper-item>
        <image src="{{item.src}}" data-id="{{item.id}}" bindtap="goToDetail" mode="aspectFill"></image>
      </swiper-item>
    </block>
  </swiper>
</view>
<!--新闻列表-->
<view id='news-list' class="news-list">
  <view class='list-item' wx:for="{{newsList}}" wx:for-item="news" wx:key="{{news.id}}">
    <image src='{{news.poster}}' mode="aspectFill"></image>
    <view class="list-info">
      <text class="list-title" bindtap='goToDetail' data-id='{{news.id}}'>{{news.title}}</text>
      <text class="list-date">{{news.add_date}}</text>
    </view>
  </view>
</view>
```

新闻列表采用统一的卡片样式（圆角白色卡片、图片圆角、标题两行省略、日期置灰），该样式由首页和个人中心共享，统一定义在全局 `app.wxss` 中：

```css
.list-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 20rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}
.list-item image {
  width: 240rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}
.list-title {
  font-size: 30rpx;
  color: #333;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.list-date {
  font-size: 24rpx;
  color: #999;
}
```

页面逻辑中，`onLoad` 时调用 `common.getNewsList()` 获取模拟新闻列表；`goToDetail` 从点击元素的 `dataset` 中取出新闻 `id`，通过 `wx.navigateTo` 携带参数跳转详情页：

```javascript
goToDetail: function(e) {
  let id = e.currentTarget.dataset.id;
  wx.navigateTo({
    url: '../detail/detail?id=' + id
  })
},
```

### 3. 新闻详情页设计（`detail`）

详情页展示新闻标题、海报、正文和日期。核心是收藏功能：页面加载时先查本地缓存判断当前新闻是否已收藏，据此初始化 `isAdd` 状态；已收藏则直接读取缓存内容，未收藏则从 `common.getNewsDetail(id)` 获取（`code == '200'` 表示命中）：

```javascript
onLoad(options) {
  let id = options.id
  //检查当前新闻是否在收藏夹中
  var newarticle = wx.getStorageSync(id)
  if (newarticle != '') {        //已存在
    this.setData({ isAdd: true, article: newarticle })
  } else {                       //不存在
    let result = common.getNewsDetail(id)
    if (result.code == '200') {
      this.setData({ article: result.news, isAdd: false })
    }
  }
},
//添加收藏
addFavorites: function() {
  let article = this.data.article
  wx.setStorageSync(article.id, article)   //以新闻id为key存入本地缓存
  this.setData({ isAdd: true })
},
//取消收藏
cancelFavorites: function() {
  let article = this.data.article
  wx.removeStorageSync(article.id)         //从本地缓存删除
  this.setData({ isAdd: false })
}
```

页面上通过 `wx:if` / `wx:else` 根据 `isAdd` 动态显示"已收藏"和"未收藏"两个按钮，按钮做成胶囊样式，文字在按钮内水平垂直居中：

```xml
<view class="fav-btn">
  <button wx:if="{{isAdd}}" class="btn btn-added" bindtap="cancelFavorites">❤️ 已收藏</button>
  <button wx:else class="btn btn-add" bindtap="addFavorites">❤️ 收藏</button>
</view>
```

按钮通过两套样式区分状态：未收藏为白底蓝字（`.btn-add`），已收藏为蓝底白字（`.btn-added`）：

```css
button.btn {
  width: 360rpx;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
button.btn-add {
  background: #ffffff;
  color: #328EEB;
  border: 2rpx solid #328EEB;
}
button.btn-added {
  background: linear-gradient(135deg, #328EEB, #65B0FF);
  color: #ffffff;
}
```

### 4. 个人中心页设计（`my`）

个人中心分登录区和收藏列表两部分。未登录时只显示"未登录，点此登录"按钮，点击后通过 `wx.getUserProfile` 获取微信头像与昵称并展示：

```javascript
getUserInfo() {
  let that = this
  wx.getUserProfile({
    desc: 'desc',
    success(res) {
      res = res.userInfo
      that.setData({
        isLogin: true,
        src: res.avatarUrl,
        nickName: res.nickName
      })
    }
  })
}
```

登录后 `onShow` 检查登录状态并调用 `getMyFavorites` 读取本地缓存，构建收藏新闻列表。读取时不是直接使用缓存 key 的数量，而是逐个校验值是否为真正的新闻对象（同时具有 `id` 和 `title`），过滤掉系统写入的非新闻数据后再计数和展示，保证收藏数量与列表内容准确一致：

```javascript
getMyFavorites: function() {
  let info = wx.getStorageInfoSync()
  let keys = info.keys

  let myList = [];
  for (var i = 0; i < keys.length; i++) {
    let obj = wx.getStorageSync(keys[i])
    //缓存中可能混有系统写入的非新闻数据，只保留真正的新闻收藏
    if (obj && obj.id && obj.title) {
      myList.push(obj)
    }
  }
  this.setData({ newsList: myList, number: myList.length })
},
```

收藏列表采用与首页完全相同的卡片结构与样式（共用 `app.wxss` 中的列表样式），点击任意收藏新闻同样通过 `goToDetail` 跳转阅读全文。

### 5. 功能完善与个性化改进

在完成基础功能后，对小程序做了以下完善：

**收藏计数修正**：本地缓存中除收藏的新闻外还包含系统写入的其他数据，直接统计 `keys.length` 会始终多出 1 个，改为按"是否真正的新闻对象"过滤后再计数；
**收藏列表样式统一**：个人中心收藏列表与首页新闻列表共用 `app.wxss` 中的卡片样式（图片尺寸、圆角、标题两行省略、日期置灰），视觉上如同一体；
**幻灯片点击跳转**：给 `swiperImg` 数据补充了对应的新闻 `id`，并为轮播图片绑定点击事件，点击幻灯片即可进入对应新闻详情；
**详情页文字排版优化**：标题加大加粗、正文放入白色卡片并加大行高、两端对齐、日期弱化为浅灰色，阅读体验更舒适；
**整体界面美化**：统一"海大蓝 + 白色卡片"风格——页面背景改为浅灰，轮播图加圆角与阴影，新闻列表由单行文本改为"左图右文"卡片（图片圆角、标题两行省略、日期置灰），个人中心登录区改为渐变蓝色头部卡片（圆形头像 + 昵称 + 欢迎语），并给收藏按钮设计两态样式（未收藏白底蓝字、已收藏蓝底白字），文字在按钮内居中。

### 6. 运行效果

首页（幻灯片 + 新闻列表）：

![](./img/1.png)

新闻详情页（全文 + 收藏/取消收藏按钮）：

![](./img/2.png)

个人中心页（登录状态 + 收藏夹列表）：

![](./img/3.png)

## 二、问题总结与体会

### 问题 1：控制台报错 `isAdd is not defined`（ReferenceError）

**现象**：进入新闻详情页时控制台报 `ReferenceError: isAdd is not defined`，收藏按钮状态错乱。

**解决**：WXML 中的 `{{isAdd}}` 是数据绑定，渲染时会去页面的 `data` 中查找该变量——如果 `data` 里没有声明，就会抛出"未定义"错误。在 `data` 中补上 `isAdd: false` 初始值后问题消失。另外排查时发现，开发者工具编译的是修改前的旧版本 JS，点击工具栏"编译"重新打包后报错不再出现。

**体会**：这让我真正理解了 WXML 数据绑定的作用域机制：模板中出现的每一个变量都必须先在页面的 `data` 中声明，否则渲染层会直接报错；同时调试时要留意开发者工具可能缓存旧代码，改完代码记得重新编译。

### 问题 2：收藏计数始终比实际收藏数多 1

**现象**：收藏 2 条新闻后，"我的收藏"显示数量为 3。

**解决**：`wx.getStorageInfoSync()` 返回的 `keys` 是本地缓存中**所有**的 key，除了收藏的新闻（以新闻 id 为 key），还混有系统写入的其他数据。原来的代码直接取 `keys.length` 作为收藏数量，必然多算；收藏列表里也会混入一个非新闻对象。改为在遍历时用 `obj.id && obj.title` 校验是否为真正的新闻，只把符合条件的对象加入列表，并用过滤后的 `myList.length` 作为数量。

### 问题 3：幻灯片不能点击进入详情页

**现象**：轮播图只能自动播放，点击没有反应，无法像新闻列表那样跳转。

**解决**：`swiperImg` 数据源里只有图片地址 `src`，没有新闻 `id`，跳转时没有可携带的参数。给每条数据补上与 `common.js` 中对应的 `id`，并在 `<image>` 上添加 `data-id="{{item.id}}"` 和 `bindtap="goToDetail"`，复用首页已有的跳转函数即可实现"点击幻灯片 → 打开对应新闻"。



### 收获与体会

本次实验让我把前面学到的知识完整地串了起来：`swiper` 轮播、`wx:for` 列表渲染、`wx:if/wx:else` 条件渲染、`navigateTo` 页面跳转与参数传递，以及 `wx.setStorageSync / removeStorageSync / getStorageInfoSync` 本地存储 API 的配合使用。通过收藏功能，我理解了"以数据 id 为 key 的缓存存取"这种简单可靠的本地数据持久化方式；通过排查计数多 1 和变量未定义的报错，加深了对小程序数据绑定机制和缓存 key 空间的认识。整个开发过程也让我体会到小程序"页面视图 + 逻辑数据分离"的架构思想，调试时利用开发者工具的 AppData 面板观察数据变化非常高效。

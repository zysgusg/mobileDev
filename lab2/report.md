<center>姓名：周洋迅  学号：24020007175</center>

| 姓名和学号？         | 周洋迅，24020007175                                          |
| -------------------- | ------------------------------------------------------------ |
| 本实验属于哪门课程？ | 中国海洋大学26夏《移动软件开发》                             |
| 实验名称？           | 实验2：名片小程序                                            |
| 博客地址？           | https://blog.csdn.net/2401_85763240/article/details/164063445 |
| 代码仓库地址？       | https://github.com/zysgusg/mobileDev                         |

## 一、实验内容

本次实验以制作一个专属于自己的微信小程序名片为目标，内容包括：使用 AI 工具生成 16:9 的名片头图，再按照参考视频完成小程序开发，上半部分展示 AI 生成的头图，下半部分为个人介绍，并支持一键复制邮箱、分享名片等功能。具体步骤如下：

### 1. 用 AI 生成名片头图

使用 AI 绘图工具生成了一张 16:9 的个人名片头图（`img/head.jpg`），画面带有姓名展示区域与代码元素，与下方自定义介绍形成呼应。

### 2. 搭建小程序页面结构（`wxml`）

页面采用 `navigation-bar` 自定义导航栏 + `scroll-view` 滚动布局，从上到下分为四块：顶部头图区、关于我、个人标签、电子名片。

```xml
<!-- 顶部展示：AI 头图 + 姓名学校专业 + 操作按钮 -->
<view class="hero fade-up">
  <image class="banner" mode="widthFix" src="../../img/head.jpg"></image>
  <view class="hero-info">
    <view class="hero-sub">{{name}} · {{school}} · {{major}}</view>
    <view class="hero-actions">
      <button class="btn btn-primary" bindtap="copyEmail">复制邮箱</button>
      <button class="btn btn-outline" open-type="share">分享名片</button>
    </view>
  </view>
</view>

<!-- 电子名片：底图 + 校徽 + 信息 -->
<view class="card">
  <image class="bg" mode="widthFix" src="../../img/bg.png"></image>
  <image class="logo" mode="widthFix" src="../../img/ouc.png"></image>
  <view class="info">
    <view class="name">{{name}}</view>
    <view class="desc">{{school}} 信息学部 计算机科学与技术专业</view>
    <view class="email">{{email}}</view>
  </view>
</view>
```

### 3. 页面样式（`wxss`）

整体采用浅色科技风设计：主色为 `#2563EB` 蓝色，白色圆角卡片 + 细阴影营造层次感；「复制邮箱」为主按钮带投影，「分享名片」为描边按钮；各分区标题前用蓝色竖条作为视觉标记；各模块添加了 `fadeUp` 淡入上移动画，并通过 `delay-1 ~ delay-4` 实现依次入场的效果。

```css
.btn-primary {
  background: #2563EB;
  color: #FFFFFF;
  box-shadow: 0 10rpx 24rpx rgba(37, 99, 235, 0.28);
}

.fade-up {
  opacity: 0;
  animation: fadeUp 0.6s ease forwards;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(40rpx); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 4. 页面逻辑（`js`）

在 `data` 中集中管理姓名、学校、专业、邮箱、个人简介、标签等数据，方便统一修改维护。实现了两个核心交互：

- **复制邮箱**：调用 `wx.setClipboardData` 将邮箱写入剪贴板，并弹出提示；
- **分享名片**：在 `open-type="share"` 的基础上实现 `onShareAppMessage` 与 `onShareTimeline`，支持分享给好友和分享到朋友圈。

```javascript
copyEmail() {
  wx.setClipboardData({
    data: this.data.email,
    success: () => {
      wx.showToast({ title: '邮箱已复制', icon: 'success' });
    }
  });
},

onShareAppMessage() {
  return { title: '周洋迅的电子名片', path: '/pages/index/index' };
},
```

### 5. 运行效果

![](.\img\1.png)![](.\img\2.png)

## 二、问题总结与体会

### 问题 1：小程序不能正常分享

**解决**：微信小程序默认不支持直接分享，需要在页面 `js` 中实现 `onShareAppMessage` 生命周期函数，且分享按钮必须加上 `open-type="share"` 属性才会拉起分享面板；同时实现 `onShareTimeline` 支持分享到朋友圈。补全这两处后，点击「分享名片」按钮即可正常弹出分享面板，将名片分享给好友或朋友圈。

### 问题 2：按照教程完成的名片较为简陋

**解决**：在教程示例的基础上做了个性化改造：在页面下半部分新增了「关于我」「个人标签」「电子名片」三个自定义板块，并统一设计了蓝色主色、圆角卡片、胶囊按钮和入场动画，让名片内容更丰富、更具个人风格。

### 问题 3：小程序无法滚动

**解决**：项目使用 Skyline 渲染引擎，页面设置了 `height: 100vh` 后高度被固定，内容超出屏幕就无法滑动。解决方法是把页面内容放入 `<scroll-view>` 并设置 `scroll-y` 属性，再用 flex 布局让滚动区域占据剩余高度，超出部分即可正常上下滚动浏览。

### 收获与体会

本次实验让我完整走了一遍"AI 生成素材 → 页面结构 → 样式美化 → 交互逻辑"的小程序开发流程。最大的收获是理解了 `wxml / wxss / js / json` 四种文件的分工协作方式：数据集中在 `data` 中、结构与样式分离，配合 `{{ }}` 数据绑定，修改数据即可全局更新页面，开发效率很高。另外，实现"复制邮箱"和"分享名片"这两个真实场景功能时，查阅官方 API 文档也让我体会到小程序生态"开箱即用"的便利。

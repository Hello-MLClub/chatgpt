# 爱贝壳内容同步助手 Chrome 扩展

这是爱贝壳内容同步助手的完整 Chrome 浏览器扩展项目。该扩展帮助自媒体人一键将内容分发到 50+ 个平台。

## 📋 功能特点

- **📄 文章同步** - 支持同步到微信公众号、知乎、CSDN、掘金等 20+ 平台
- **🎬 视频同步** - 支持抖音、快手、B站、YouTube 等视频平台
- **💬 动态分发** - 支持微博、小红书、知乎、Reddit 等社交平台
- **🎙️ 播客发布** - 支持喜马拉雅、小宇宙、蜻蜓FM
- **🎨 智能格式转换** - 自动适配各平台的格式要求
- **⚙️ 灵活设置** - 支持自定义同步参数和平台配置
- **💾 本地存储** - 所有数据本地保存，不上传到云端

## 🚀 快速开始

### 安装步骤

1. **克隆或下载项目**
   ```bash
   git clone https://github.com/Hello-MLClub/chatgpt.git
   cd chatgpt
   ```

2. **打开 Chrome 扩展页面**
   - 在 Chrome 中输入 `chrome://extensions/`
   - 启用右上角的「开发者模式」

3. **加载未压缩的扩展程序**
   - 点击「加载未压缩的扩展程序」
   - 选择项目的根目录

4. **完成！**
   - 现在你应该在扩展列表中看到"爱贝壳内容同步助手"
   - 点击浏览器工具栏中的扩展图标开始使用

## 📁 项目结构

```
.
├── manifest.json              # 扩展配置文件
├── popup.html                 # 弹窗界面
├── popup.js                   # 弹窗逻辑
├── options.html               # 设置页面
├── options.js                 # 设置逻辑
├── background.js              # 后台脚本
├── content.js                 # 内容脚本
├── styles/
│   ├── common.css             # 公共样式
│   ├── popup.css              # 弹窗样式
│   └── options.css            # 设置页样式
├── utils/
│   ├── platforms.js           # 平台配置
│   └── storage.js             # 存储管理
└── icons/                     # 扩展图标
    ├── icon-16.png
    ├── icon-48.png
    ├── icon-128.png
    └── icon-256.png
```

## 💡 使用指南

### 基础操作

1. **打开扩展弹窗**
   - 点击浏览器工具栏中的爱贝壳图标

2. **选择内容类型**
   - 📄 文章 - 用于长篇内容
   - 🎬 视频 - 用于视频文件
   - 💬 动态 - 用于短文本和图片
   - 🎙️ 播客 - 用于音频内容

3. **输入或获取内容**
   - 输入文章链接或标题
   - 点击「获取内容」按钮

4. **选择目标平台**
   - 在平台列表中勾选要同步的平台
   - 最多可一次选择所有平台

5. **开始同步**
   - 点击「🚀 开始同步」按钮
   - 等待同步完成

### 设置选项

- **自动提取内容** - 访问支持的平台时自动提取内容
- **自动填充内容** - 同步时自动填充目标平台的内容框
- **同步提醒** - 同步完成时显示浏览器通知
- **同步超时时间** - 设置每个平台的超时时间
- **批量同步数** - 同时同步的平台数量
- **最大重试次数** - 失败自动重试的次数

## 🛠️ 开发

### 核心模块说明

#### manifest.json
- 扩展的配置文件
- 定义权限、脚本、样式等

#### popup.html/js
- 用户点击扩展图标打开的弹窗界面
- 管理内容输入、平台选择、同步操作

#### options.html/js
- 扩展的设置页面
- 用户可自定义各项参数

#### background.js
- 后台服务工作者
- 处理消息传递和跨域请求

#### content.js
- 在网页上下文运行的脚本
- 检测支持的平台并注入浮动按钮

#### utils/platforms.js
- 所有支持的平台配置
- 包括名称、图标、分类等

#### utils/storage.js
- Chrome 存储 API 的封装
- 提供更便捷的数据存储接口

### 添加新平台

1. 在 `utils/platforms.js` 中添加平台配置：
   ```javascript
   { id: 'platform_id', name: '平台名称', icon: '📱', enabled: true }
   ```

2. 在 `content.js` 中添加平台检测：
   ```javascript
   'platform.domain': 'platform_id'
   ```

3. 在 `content.js` 中添加内容提取函数：
   ```javascript
   function extractPlatformContent() {
     // 提取逻辑
   }
   ```

## 🔒 隐私与安全

- 所有账号信息都存储在浏览器本地，不会传输到服务器
- 扩展不会保存用户的账号密码
- 仅在用户明确点击「开始同步」时才进行操作
- 所有数据都可随时导出或删除

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系我们

- 官方网站：[爱贝壳](https://lizhi.shop/products/aibeike-post-sync-assistant)
- GitHub：[iuwy/aibeike-post-sync-assistant](https://github.com/iuwy/aibeike-post-sync-assistant)

---

**祝你使用愉快！** 🎉

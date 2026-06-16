# Viral Topic Finder Chrome Extension

这是一个可本地安装的 Chrome Manifest V3 扩展，把 kangarooking-skills 的 `viral-topic` 工作流封装为可视化工具，用于跨平台爆款选题参考。

## 先解决「清单文件缺失或不可读取」

Chrome 只能加载**包含 `manifest.json` 的文件夹**，不能直接选择 `.zip` 文件，也不能选择没有清单的外层目录。

请按下面方式安装：

1. 如果你从 GitHub 下载的是 `chatgpt-main.zip`，先右键「全部解压」。
2. 打开 Chrome，进入 `chrome://extensions/`。
3. 打开右上角「开发者模式」。
4. 点击「加载已解压的扩展程序」。
5. 选择解压后的 `chrome-extension` 文件夹，而不是选择 `Downloads`、桌面、`.zip` 文件或其它外层目录。
6. 确认你选择的文件夹里能看到 `manifest.json`、`popup.html`、`background.js` 等文件。

如果你在仓库根目录运行开发命令，可以先执行：

```bash
npm run prepare:extension
```

这会把扩展所需文件同步到 `chrome-extension/`，Chrome 加载时请选择这个目录。

## 功能

- 支持 YouTube、X/Twitter、Bilibili、WeChat 四个平台的选题参数配置。
- 内置 viral-topic 路由默认值：
  - WeChat：7 天、阅读量 10,000、月均阅读倍率 2。
  - X：7 天、作者粉丝不超过 50,000、互动量 100。
  - Bilibili：30 天、UP 主粉丝不超过 100,000、播放量 10,000。
  - YouTube：30 天、播放量 10,000，不默认低粉过滤。
- 支持导入 JSON 样例数据进行离线筛选和排序。
- 支持配置 YouTube Data API Key、twitterapi.io Key、WeChat 热榜 API 地址与凭据。
- 对缺少密钥或浏览器跨域限制的平台显示可执行命令与原因，避免误判为无结果。

## 使用说明

1. 在弹窗中输入选题方向，例如 `AI agent, Claude Code, AI编程`。
2. 选择平台，点击「开始搜索」。
3. 有 API Key 的平台会尝试实时搜索；没有 Key 的平台会返回配置提示。
4. 若手头已有平台脚本导出的 JSON，可粘贴到「离线 JSON」中，无需 API Key 也能筛选排序。

## 开发与打包

```bash
npm run check
npm run prepare:extension
npm run zip:extension
```

- `npm run check`：检查 JS 语法、根目录清单 JSON、以及 `chrome-extension/` 是否包含可读取清单与必要文件。
- `npm run prepare:extension`：把仓库根目录源码同步到 `chrome-extension/`。
- `npm run zip:extension`：生成 `dist/viral-topic-finder.zip`，用于分发；本地调试仍需先解压后再加载文件夹。

## 隐私与安全

API Key 仅保存到浏览器本地 `chrome.storage.local`，不会写入代码仓库。请不要把密钥提交到 Git。

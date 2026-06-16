# Viral Topic Finder Chrome Extension

这是一个可本地安装的 Chrome Manifest V3 扩展，把 kangarooking-skills 的 `viral-topic` 工作流封装为可视化工具，用于跨平台爆款选题参考。

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

## 安装到 Chrome

1. 打开 Chrome，进入 `chrome://extensions/`。
2. 打开右上角「开发者模式」。
3. 点击「加载已解压的扩展程序」。
4. 选择本仓库目录 `/workspace/chatgpt`。
5. 点击扩展图标，先到「设置」填写需要的平台 API Key。

## 使用说明

1. 在弹窗中输入选题方向，例如 `AI agent, Claude Code, AI编程`。
2. 选择平台，点击「开始搜索」。
3. 有 API Key 的平台会尝试实时搜索；没有 Key 的平台会返回配置提示。
4. 若手头已有平台脚本导出的 JSON，可粘贴到「离线 JSON」中，无需 API Key 也能筛选排序。

## 隐私与安全

API Key 仅保存到浏览器本地 `chrome.storage.local`，不会写入代码仓库。请不要把密钥提交到 Git。

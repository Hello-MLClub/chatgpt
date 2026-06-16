// 平台配置

const PLATFORMS_CONFIG = {
  // 图文动态
  social: [
    { id: 'weibo', name: '微博', icon: '🔴', enabled: true },
    { id: 'xiaohongshu', name: '小红书', icon: '❤️', enabled: true },
    { id: 'zhihu', name: '知乎', icon: '❓', enabled: true },
    { id: 'douban', name: '豆瓣', icon: '🎭', enabled: true },
    { id: 'jike', name: '即刻', icon: '⚡', enabled: true },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', enabled: true },
    { id: 'threads', name: 'Threads', icon: '🧵', enabled: true },
    { id: 'reddit', name: 'Reddit', icon: '🤖', enabled: true },
    { id: 'bsky', name: 'Bluesky', icon: '🦋', enabled: true }
  ],

  // 文章
  article: [
    { id: 'wechat', name: '微信公众号', icon: '🟢', enabled: true },
    { id: 'toutiao', name: '头条号', icon: '📰', enabled: true },
    { id: 'baijia', name: '百家号', icon: '🏠', enabled: true },
    { id: 'csdn', name: 'CSDN', icon: '💻', enabled: true },
    { id: 'juejin', name: '掘金', icon: '⛏️', enabled: true },
    { id: 'jianshu', name: '简书', icon: '✏️', enabled: true },
    { id: 'medium', name: 'Medium', icon: '📝', enabled: true },
    { id: 'wordpress', name: 'WordPress', icon: '📄', enabled: true }
  ],

  // 视频
  video: [
    { id: 'douyin', name: '抖音', icon: '🎵', enabled: true },
    { id: 'kuaishou', name: '快手', icon: '⚡', enabled: true },
    { id: 'bilibili', name: 'B站', icon: '📺', enabled: true },
    { id: 'xiaohongshu', name: '小红书', icon: '❤️', enabled: true },
    { id: 'youtube', name: 'YouTube', icon: '📹', enabled: true },
    { id: 'tiktok', name: 'TikTok', icon: '🎬', enabled: true }
  ],

  // 播客
  podcast: [
    { id: 'ximalaya', name: '喜马拉雅', icon: '🎙️', enabled: true },
    { id: 'xiaoyuzhou', name: '小宇宙', icon: '🪐', enabled: true },
    { id: 'qingting', name: '蜻蜓FM', icon: '🎧', enabled: true }
  ]
};

function getPlatformsByMode(mode) {
  return PLATFORMS_CONFIG[mode] || [];
}

function getAllPlatforms() {
  return Object.values(PLATFORMS_CONFIG).flat();
}

function getPlatformName(platformId) {
  const platform = getAllPlatforms().find(p => p.id === platformId);
  return platform?.name || platformId;
}

function getPlatformIcon(platformId) {
  const platform = getAllPlatforms().find(p => p.id === platformId);
  return platform?.icon || '🔗';
}

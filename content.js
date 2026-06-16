// 内容脚本 - 在页面上下文中运行

// 页面加载时注入按钮
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectUI);
} else {
  injectUI();
}

function injectUI() {
  // 检测当前页面是否支持
  const platform = detectPlatform();
  if (platform) {
    injectFloatingButton(platform);
  }
}

function detectPlatform() {
  const hostname = window.location.hostname;
  const platforms = {
    'zhihu.com': 'zhihu',
    'weibo.com': 'weibo',
    'xiaohongshu.com': 'xiaohongshu',
    'bilibili.com': 'bilibili',
    'douyin.com': 'douyin',
    'kuaishou.com': 'kuaishou',
    'medium.com': 'medium',
    'csdn.net': 'csdn'
  };

  for (const [domain, platform] of Object.entries(platforms)) {
    if (hostname.includes(domain)) {
      return platform;
    }
  }
  return null;
}

function injectFloatingButton(platform) {
  const button = document.createElement('button');
  button.id = 'aibeike-float-btn';
  button.className = 'aibeike-float-btn';
  button.innerHTML = '📤 爱贝壳';
  button.title = '使用爱贝壳同步此内容';

  button.addEventListener('click', () => {
    extractAndSync(platform);
  });

  document.body.appendChild(button);
  addFloatingButtonStyles();
}

function addFloatingButtonStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .aibeike-float-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 10000;
      padding: 12px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }

    .aibeike-float-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    .aibeike-float-btn:active {
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
}

async function extractAndSync(platform) {
  const content = extractContent(platform);
  chrome.runtime.sendMessage(
    { action: 'syncContent', data: { content, platform } },
    response => {
      if (response.success) {
        showNotification('内容已提交到爱贝壳！', 'success');
      } else {
        showNotification('提交失败，请重试', 'error');
      }
    }
  );
}

function extractContent(platform) {
  let content = {};

  switch (platform) {
    case 'zhihu':
      content = extractZhihuContent();
      break;
    case 'weibo':
      content = extractWeiboContent();
      break;
    case 'xiaohongshu':
      content = extractXiaohongshuContent();
      break;
    default:
      content = extractGenericContent();
  }

  return content;
}

function extractZhihuContent() {
  return {
    title: document.querySelector('h1')?.textContent || '',
    content: document.querySelector('[data-testid="richTextContent"]')?.innerHTML || '',
    platform: 'zhihu'
  };
}

function extractWeiboContent() {
  return {
    content: document.querySelector('.txt')?.textContent || '',
    images: Array.from(document.querySelectorAll('img')).map(img => img.src),
    platform: 'weibo'
  };
}

function extractXiaohongshuContent() {
  return {
    title: document.querySelector('.title')?.textContent || '',
    content: document.querySelector('.desc')?.textContent || '',
    platform: 'xiaohongshu'
  };
}

function extractGenericContent() {
  return {
    title: document.title,
    url: window.location.href,
    timestamp: new Date().toISOString()
  };
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `aibeike-notification aibeike-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    padding: 12px 20px;
    background: ${type === 'success' ? '#4caf50' : '#f44336'};
    color: white;
    border-radius: 4px;
    font-size: 14px;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

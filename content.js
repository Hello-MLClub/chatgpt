// 更新content.js——添加内容提取功能

// 页面加载时注入按钮
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectUI);
} else {
  injectUI();
}

function injectUI() {
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
    'csdn.net': 'csdn',
    'juejin.cn': 'juejin',
    'mp.weixin.qq.com': 'wechat'
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
  const content = await extractContent(platform);
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

async function extractContent(platform) {
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
    case 'wechat':
      content = extractWechatContent();
      break;
    case 'csdn':
      content = extractCsdnContent();
      break;
    case 'juejin':
      content = extractJuejinContent();
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
    text: document.querySelector('[data-testid="richTextContent"]')?.innerText || '',
    author: document.querySelector('[data-testid="author"]')?.innerText || '',
    platform: 'zhihu',
    url: window.location.href
  };
}

function extractWechatContent() {
  return {
    title: document.querySelector('#activity-name')?.innerText || document.title,
    content: document.querySelector('#js_content')?.innerHTML || '',
    text: document.querySelector('#js_content')?.innerText || '',
    author: document.querySelector('#js_name')?.innerText || '',
    publishDate: document.querySelector('#publish_time')?.innerText || '',
    platform: 'wechat',
    url: window.location.href
  };
}

function extractWeiboContent() {
  return {
    content: document.querySelector('.txt')?.textContent || '',
    images: Array.from(document.querySelectorAll('img')).map(img => img.src),
    author: document.querySelector('.name')?.textContent || '',
    platform: 'weibo',
    url: window.location.href
  };
}

function extractXiaohongshuContent() {
  return {
    title: document.querySelector('.title')?.textContent || '',
    content: document.querySelector('.desc')?.textContent || '',
    platform: 'xiaohongshu',
    url: window.location.href
  };
}

function extractCsdnContent() {
  return {
    title: document.querySelector('h1')?.innerText || '',
    content: document.querySelector('.blog-content-box')?.innerHTML || '',
    text: document.querySelector('.blog-content-box')?.innerText || '',
    author: document.querySelector('.blog-author-box')?.innerText || '',
    platform: 'csdn',
    url: window.location.href
  };
}

function extractJuejinContent() {
  return {
    title: document.querySelector('h1')?.innerText || '',
    content: document.querySelector('.markdown-body')?.innerHTML || '',
    text: document.querySelector('.markdown-body')?.innerText || '',
    author: document.querySelector('[data-testid="author-info"]')?.innerText || '',
    platform: 'juejin',
    url: window.location.href
  };
}

function extractGenericContent() {
  return {
    title: document.title,
    text: document.body.innerText,
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

// 接受来自popup的消息 - 提取当前页面内容
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
    extractAndReturnContent().then(content => {
      sendResponse({ success: true, data: content });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // 保持通道打开的提示
  }
});

async function extractAndReturnContent() {
  const platform = detectPlatform();
  
  if (platform === 'wechat') {
    return extractWechatContent();
  } else if (platform === 'zhihu') {
    return extractZhihuContent();
  } else if (platform === 'csdn') {
    return extractCsdnContent();
  } else if (platform === 'juejin') {
    return extractJuejinContent();
  } else {
    return extractGenericContent();
  }
}

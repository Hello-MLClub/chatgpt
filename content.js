// 改进的 content.js - 修复消息传递和内容提取

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
    'mp.weixin.qq.com': 'wechat',
    'jianshu.com': 'jianshu'
  };

  for (const [domain, platform] of Object.entries(platforms)) {
    if (hostname.includes(domain)) {
      return platform;
    }
  }
  return null;
}

function injectFloatingButton(platform) {
  // 避免重复注入
  if (document.getElementById('aibeike-float-btn')) {
    return;
  }

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
  // 避免重复添加样式
  if (document.getElementById('aibeike-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'aibeike-styles';
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
      font-family: system-ui, -apple-system, sans-serif;
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
  showNotification('正在提取内容...', 'info');
  const content = await extractContent(platform);
  
  console.log('[爱贝壳] 提取的内容:', content);
  
  // 发送到 popup
  chrome.runtime.sendMessage(
    { action: 'contentExtracted', data: content },
    response => {
      if (response && response.success) {
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
    case 'wechat':
      content = extractWechatContent();
      break;
    case 'zhihu':
      content = extractZhihuContent();
      break;
    case 'weibo':
      content = extractWeiboContent();
      break;
    case 'xiaohongshu':
      content = extractXiaohongshuContent();
      break;
    case 'csdn':
      content = extractCsdnContent();
      break;
    case 'juejin':
      content = extractJuejinContent();
      break;
    case 'jianshu':
      content = extractJianshuContent();
      break;
    default:
      content = extractGenericContent();
  }

  // 添加平台标记
  content.platform = platform;
  content.extractedAt = new Date().toISOString();
  content.url = window.location.href;

  return content;
}

// 微信公众号内容提取
function extractWechatContent() {
  const result = {
    title: '',
    author: '',
    content: '',
    text: '',
    images: [],
    publishDate: '',
    views: '',
    markdown: ''
  };

  try {
    // 标题
    const titleEl = document.querySelector('#activity-name') || document.querySelector('h1');
    result.title = titleEl ? titleEl.innerText : document.title;

    // 作者
    const authorEl = document.querySelector('#js_name') || document.querySelector('[class*="author"]');
    result.author = authorEl ? authorEl.innerText : '';

    // 内容
    const contentEl = document.querySelector('#js_content');
    if (contentEl) {
      result.content = contentEl.innerHTML;
      result.text = contentEl.innerText;
      result.markdown = contentEl.innerText; // 简单处理
    }

    // 图片
    const images = contentEl ? contentEl.querySelectorAll('img') : [];
    result.images = Array.from(images)
      .filter(img => img.src && !img.src.includes('data:'))
      .map(img => ({
        url: img.src,
        alt: img.alt || '图片'
      }))
      .slice(0, 20); // 限制20张

    // 发布日期
    const dateEl = document.querySelector('#publish_time');
    result.publishDate = dateEl ? dateEl.innerText : '';

    // 阅读数
    const viewsEl = document.querySelector('#js_read_stat');
    result.views = viewsEl ? viewsEl.innerText : '';
  } catch (error) {
    console.error('[爱贝壳] 微信提取错误:', error);
  }

  return result;
}

// 知乎内容提取
function extractZhihuContent() {
  const result = {
    title: '',
    author: '',
    content: '',
    text: '',
    images: [],
    tags: [],
    likes: '',
    comments: '',
    markdown: ''
  };

  try {
    // 标题
    const titleEl = document.querySelector('h1');
    result.title = titleEl ? titleEl.innerText : document.title;

    // 作者
    const authorEl = document.querySelector('[data-testid="author"]');
    result.author = authorEl ? authorEl.innerText : '';

    // 内容
    const contentEl = document.querySelector('[data-testid="richTextContent"]') || 
                     document.querySelector('[class*="RichContent"]');
    if (contentEl) {
      result.content = contentEl.innerHTML;
      result.text = contentEl.innerText;
      result.markdown = contentEl.innerText;
    }

    // 图片
    const images = document.querySelectorAll('img[src*="zhimg"]');
    result.images = Array.from(images)
      .map(img => ({
        url: img.src,
        alt: img.alt || '图片'
      }))
      .slice(0, 20);

    // 标签
    const tags = document.querySelectorAll('[class*="Tag"]');
    result.tags = Array.from(tags).map(t => t.innerText).slice(0, 10);

    // 点赞和评论
    const likesEl = document.querySelector('[data-testid="voteCount"]');
    result.likes = likesEl ? likesEl.innerText : '';
    
    const commentsEl = document.querySelector('[class*="CommentCount"]');
    result.comments = commentsEl ? commentsEl.innerText : '';
  } catch (error) {
    console.error('[爱贝壳] 知乎提取错误:', error);
  }

  return result;
}

// CSDN 内容提取
function extractCsdnContent() {
  const result = {
    title: '',
    author: '',
    content: '',
    text: '',
    images: [],
    tags: [],
    category: '',
    views: '',
    markdown: ''
  };

  try {
    // 标题
    const titleEl = document.querySelector('h1');
    result.title = titleEl ? titleEl.innerText : document.title;

    // 作者
    const authorEl = document.querySelector('.blog-author-box .avatar-container + div');
    result.author = authorEl ? authorEl.innerText : '';

    // 内容
    const contentEl = document.querySelector('.blog-content-box');
    if (contentEl) {
      result.content = contentEl.innerHTML;
      result.text = contentEl.innerText;
      result.markdown = contentEl.innerText;
    }

    // 图片
    const images = contentEl ? contentEl.querySelectorAll('img') : [];
    result.images = Array.from(images)
      .filter(img => img.src && !img.src.includes('data:'))
      .map(img => ({
        url: img.src,
        alt: img.alt || '图片'
      }))
      .slice(0, 20);

    // 标签
    const tags = document.querySelectorAll('.tag-link');
    result.tags = Array.from(tags).map(t => t.innerText).slice(0, 10);

    // 分类
    const categoryEl = document.querySelector('[class*="category"]');
    result.category = categoryEl ? categoryEl.innerText : '';

    // 浏览数
    const viewsEl = document.querySelector('.read-count');
    result.views = viewsEl ? viewsEl.innerText : '';
  } catch (error) {
    console.error('[爱贝壳] CSDN提取错误:', error);
  }

  return result;
}

// 掘金内容提取
function extractJuejinContent() {
  const result = {
    title: '',
    author: '',
    content: '',
    text: '',
    images: [],
    tags: [],
    category: '',
    markdown: ''
  };

  try {
    // 标题
    const titleEl = document.querySelector('h1');
    result.title = titleEl ? titleEl.innerText : document.title;

    // 内容
    const contentEl = document.querySelector('.markdown-body');
    if (contentEl) {
      result.content = contentEl.innerHTML;
      result.text = contentEl.innerText;
      result.markdown = contentEl.innerText;
    }

    // 作者
    const authorEl = document.querySelector('[data-testid="author-info"]');
    result.author = authorEl ? authorEl.innerText : '';

    // 图片
    const images = contentEl ? contentEl.querySelectorAll('img') : [];
    result.images = Array.from(images)
      .map(img => ({
        url: img.src,
        alt: img.alt || '图片'
      }))
      .slice(0, 20);

    // 标签
    const tags = document.querySelectorAll('[class*="tag"]');
    result.tags = Array.from(tags).map(t => t.innerText).slice(0, 10);
  } catch (error) {
    console.error('[爱贝壳] 掘金提取错误:', error);
  }

  return result;
}

// 简书内容提取
function extractJianshuContent() {
  const result = {
    title: '',
    author: '',
    content: '',
    text: '',
    images: [],
    tags: [],
    markdown: ''
  };

  try {
    // 标题
    const titleEl = document.querySelector('h1');
    result.title = titleEl ? titleEl.innerText : document.title;

    // 内容
    const contentEl = document.querySelector('[class*="article"]') || document.querySelector('article');
    if (contentEl) {
      result.content = contentEl.innerHTML;
      result.text = contentEl.innerText;
      result.markdown = contentEl.innerText;
    }

    // 作者
    const authorEl = document.querySelector('[class*="author"]');
    result.author = authorEl ? authorEl.innerText : '';

    // 图片
    const images = contentEl ? contentEl.querySelectorAll('img') : [];
    result.images = Array.from(images)
      .map(img => ({
        url: img.src,
        alt: img.alt || '图片'
      }))
      .slice(0, 20);
  } catch (error) {
    console.error('[爱贝壳] 简书提取错误:', error);
  }

  return result;
}

// 微博内容提取
function extractWeiboContent() {
  const result = {
    content: '',
    author: '',
    images: [],
    likes: '',
    comments: '',
    shares: ''
  };

  try {
    // 内容
    const contentEl = document.querySelector('[class*="txt"]');
    result.content = contentEl ? contentEl.innerText : '';

    // 作者
    const authorEl = document.querySelector('[class*="name"]');
    result.author = authorEl ? authorEl.innerText : '';

    // 图片
    const images = document.querySelectorAll('img[src*="weibo"]');
    result.images = Array.from(images)
      .map(img => ({
        url: img.src,
        alt: img.alt || '图片'
      }))
      .slice(0, 20);
  } catch (error) {
    console.error('[爱贝壳] 微博提取错误:', error);
  }

  return result;
}

// 小红书内容提取
function extractXiaohongshuContent() {
  const result = {
    title: '',
    content: '',
    author: '',
    images: [],
    tags: [],
    likes: '',
    shares: ''
  };

  try {
    // 标题
    const titleEl = document.querySelector('[class*="title"]');
    result.title = titleEl ? titleEl.innerText : '';

    // 内容
    const contentEl = document.querySelector('[class*="desc"]');
    result.content = contentEl ? contentEl.innerText : '';

    // 作者
    const authorEl = document.querySelector('[class*="author"]');
    result.author = authorEl ? authorEl.innerText : '';

    // 图片
    const images = document.querySelectorAll('img[src*="xhscdn"]');
    result.images = Array.from(images)
      .map(img => ({
        url: img.src,
        alt: img.alt || '图片'
      }))
      .slice(0, 20);
  } catch (error) {
    console.error('[爱贝壳] 小红书提取错误:', error);
  }

  return result;
}

// 通用内容提取
function extractGenericContent() {
  const result = {
    title: document.title,
    content: document.body.innerHTML,
    text: document.body.innerText.slice(0, 5000), // 限制长度
    images: [],
    markdown: ''
  };

  // 提取图片
  const images = document.querySelectorAll('img[src]');
  result.images = Array.from(images)
    .filter(img => img.src && !img.src.includes('data:'))
    .map(img => ({
      url: img.src,
      alt: img.alt || '图片'
    }))
    .slice(0, 20);

  return result;
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `aibeike-notification aibeike-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    padding: 12px 20px;
    background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    border-radius: 4px;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// 接收来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[爱贝壳] 收到消息:', request.action);
  
  if (request.action === 'syncContent') {
    // 开始同步 - 模拟自动填充和发布
    simulateSyncToPage(request.data);
    sendResponse({ success: true });
  }
});

// 模拟在当前页面自动填充并发布
function simulateSyncToPage(data) {
  const platform = detectPlatform();
  console.log(`[爱贝壳] 准备在${platform}上同步内容`);
  
  // 这里可以根据平台自动填充表单
  // 例如: 在知乎上填充标题和内容，然后点击发布按钮
  showNotification(`已准备好在此平台发布内容，请点击发布按钮`, 'success');
}

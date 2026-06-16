// 改进的 popup.js - 添加内容预览和账号检测

const state = {
  contentMode: 'article',
  selectedPlatforms: [],
  currentContent: null,
  syncInProgress: false,
  detectedAccounts: {}
};

document.addEventListener('DOMContentLoaded', initPopup);

function initPopup() {
  setupEventListeners();
  loadPlatforms();
  restoreState();
  detectBrowserAccounts(); // 检测已登录账号
  setupMessageListener(); // 接收content.js发送的内容
}

function setupEventListeners() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', switchContentMode);
  });

  document.getElementById('fetchBtn').addEventListener('click', fetchContent);
  document.addEventListener('change', handlePlatformToggle);
  document.getElementById('syncBtn').addEventListener('click', startSync);
  document.getElementById('cancelBtn').addEventListener('click', closePopup);
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
}

// 设置消息监听 - 接收 content.js 的提取内容
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'contentExtracted') {
      console.log('[爱贝壳 Popup] 收到提取的内容:', request.data);
      state.currentContent = request.data;
      displayExtractedContent(request.data);
      sendResponse({ success: true });
    }
  });
}

// 检测浏览器已登录的账号
function detectBrowserAccounts() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    
    // 根据域名判断登录状态
    const accounts = {};
    
    if (tab.url.includes('weibo.com')) {
      accounts.weibo = '已登录';
    }
    if (tab.url.includes('zhihu.com')) {
      accounts.zhihu = '已登录';
    }
    if (tab.url.includes('csdn.net')) {
      accounts.csdn = '已登录';
    }
    if (tab.url.includes('juejin.cn')) {
      accounts.juejin = '已登录';
    }
    if (tab.url.includes('xiaohongshu.com')) {
      accounts.xiaohongshu = '已登录';
    }
    if (tab.url.includes('mp.weixin.qq.com')) {
      accounts.wechat = '已登录';
    }
    if (tab.url.includes('douyin.com')) {
      accounts.douyin = '已登录';
    }
    if (tab.url.includes('bilibili.com')) {
      accounts.bilibili = '已登录';
    }

    state.detectedAccounts = accounts;
    console.log('[爱贝壳] 检测到的账号:', accounts);
    
    // 自动勾选已登录的平台
    autoSelectLoggedInPlatforms(accounts);
  });
}

// 自动勾选已登录的平台
function autoSelectLoggedInPlatforms(accounts) {
  document.querySelectorAll('[data-platform]').forEach(checkbox => {
    const platformId = checkbox.value;
    if (accounts[platformId]) {
      checkbox.checked = true;
      if (!state.selectedPlatforms.includes(platformId)) {
        state.selectedPlatforms.push(platformId);
      }
    }
  });
  updateSelectedCount();
}

// 一键提取当前页面的内容
function fetchContent() {
  const btn = document.getElementById('fetchBtn');
  btn.textContent = '正在提取...';
  btn.disabled = true;
  
  // 向 content.js 发送消息
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'extractContent' },
      response => {
        if (response && response.success) {
          state.currentContent = response.data;
          displayExtractedContent(response.data);
          btn.textContent = '重新提取';
        } else {
          console.error('提取失败:', response?.error || '未知错误');
          btn.textContent = '获取内容';
        }
        btn.disabled = false;
      }
    );
  });
}

// 显示提取的内容
function displayExtractedContent(content) {
  console.log('[爱贝壳] 显示提取内容:', content);
  
  // 标题
  if (content.title) {
    const titleEl = document.getElementById('previewTitle');
    titleEl.value = content.title;
  }
  
  // 作者
  if (content.author) {
    const authorEl = document.getElementById('previewAuthor');
    if (authorEl) {
      authorEl.value = content.author;
    }
  }
  
  // 内容（优先 Markdown，其次 text）
  if (content.markdown || content.text) {
    const summaryEl = document.getElementById('previewSummary');
    summaryEl.value = (content.markdown || content.text).slice(0, 1000);
    summaryEl.title = '点击查看完整内容';
  }
  
  // 图片
  if (content.images && content.images.length > 0) {
    const container = document.getElementById('previewImages');
    container.innerHTML = '';
    content.images.slice(0, 9).forEach((img, index) => {
      const imgEl = document.createElement('div');
      imgEl.style.cssText = `
        position: relative;
        cursor: pointer;
        border-radius: 4px;
        overflow: hidden;
      `;
      
      const imgTag = document.createElement('img');
      imgTag.src = img.url;
      imgTag.alt = img.alt || '图片';
      imgTag.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
      imgTag.title = `${index + 1}/${content.images.length}`;
      
      // 点击查看大图
      imgTag.addEventListener('click', () => {
        showImagePreview(img.url);
      });
      
      imgEl.appendChild(imgTag);
      container.appendChild(imgEl);
    });
  }
  
  // 显示预览区域
  document.getElementById('contentPreview').classList.remove('hidden');
  
  // 启用同步按钮
  document.getElementById('syncBtn').disabled = false;
  
  // 保存内容
  state.currentContent = content;
}

// 查看大图
function showImagePreview(imageUrl) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10002;
    cursor: pointer;
  `;
  
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  `;
  
  modal.appendChild(img);
  modal.addEventListener('click', () => modal.remove());
  document.body.appendChild(modal);
}

function switchContentMode(e) {
  const mode = e.target.dataset.mode;
  state.contentMode = mode;

  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  resetContentPreview();
  updatePlatformList(mode);
}

function loadPlatforms() {
  const platforms = getPlatformsByMode(state.contentMode);
  renderPlatforms(platforms);
}

function renderPlatforms(platforms) {
  const container = document.getElementById('platformList');
  container.innerHTML = '';

  platforms.forEach(platform => {
    const label = document.createElement('label');
    label.className = 'platform-checkbox';
    
    const isLoggedIn = state.detectedAccounts[platform.id];
    const title = isLoggedIn ? `${platform.name} (已登录)` : platform.name;
    
    label.innerHTML = `
      <input type="checkbox" value="${platform.id}" data-platform="${platform.id}" ${isLoggedIn ? 'checked' : ''}>
      <span class="platform-icon">${platform.icon}</span>
      <span class="platform-name" title="${title}">${platform.name}</span>
      ${isLoggedIn ? '<span class="logged-in-badge">✓</span>' : ''}
    `;
    container.appendChild(label);
  });

  // 重新绑定已登录平台
  autoSelectLoggedInPlatforms(state.detectedAccounts);
  updateSelectedCount();
}

function handlePlatformToggle(e) {
  if (e.target.dataset.platform) {
    const platform = e.target.value;
    if (e.target.checked) {
      state.selectedPlatforms.push(platform);
    } else {
      state.selectedPlatforms = state.selectedPlatforms.filter(p => p !== platform);
    }
    updateSelectedCount();
  }
}

function updateSelectedCount() {
  const total = document.querySelectorAll('[data-platform]').length;
  const selected = state.selectedPlatforms.length;
  document.getElementById('selectedCount').textContent = selected;
  document.getElementById('totalCount').textContent = total;
  document.getElementById('syncBtn').disabled = selected === 0 || !state.currentContent;
}

function resetContentPreview() {
  document.getElementById('contentPreview').classList.add('hidden');
  document.getElementById('contentUrl').value = '';
  document.getElementById('syncBtn').disabled = true;
  state.currentContent = null;
}

async function startSync() {
  if (!state.currentContent || state.selectedPlatforms.length === 0) {
    alert('请先提取内容并选择平台');
    return;
  }

  state.syncInProgress = true;
  document.getElementById('syncStatus').classList.remove('hidden');
  document.getElementById('syncLog').innerHTML = '';

  const results = [];
  for (const platformId of state.selectedPlatforms) {
    const result = await syncToPlatform(platformId, state.currentContent);
    results.push(result);
    updateSyncLog(result);
  }

  state.syncInProgress = false;
  showSyncComplete(results);
}

async function syncToPlatform(platformId, content) {
  return new Promise(resolve => {
    // 发送消息到当前tab - 如果tab是目标平台
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0];
      const platformDomains = {
        'weibo': 'weibo.com',
        'zhihu': 'zhihu.com',
        'csdn': 'csdn.net',
        'juejin': 'juejin.cn',
        'wechat': 'mp.weixin.qq.com',
        'xiaohongshu': 'xiaohongshu.com'
      };
      
      const domain = platformDomains[platformId];
      const isCurrentPlatform = domain && tab.url.includes(domain);
      
      if (isCurrentPlatform) {
        // 在当前页面同步
        chrome.tabs.sendMessage(
          tab.id,
          { action: 'syncContent', data: content },
          response => {
            resolve({
              platform: platformId,
              success: response?.success !== false,
              message: `${getPlatformName(platformId)} - 已在当前页面进行处理`
            });
          }
        );
      } else {
        // 需要打开新tab
        resolve({
          platform: platformId,
          success: true,
          message: `${getPlatformName(platformId)} - 请打开此平台后点击"同步"按钮`
        });
      }
    });
  });
}

function updateSyncLog(result) {
  const log = document.getElementById('syncLog');
  const entry = document.createElement('div');
  entry.className = `log-entry ${result.success ? 'success' : 'error'}`;
  entry.innerHTML = `<span>${result.message}</span>`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function showSyncComplete(results) {
  const successful = results.filter(r => r.success).length;
  alert(`同步完成！成功: ${successful}/${results.length}\n\n请确认各平台内容已正确发布`);
}

function openSettings() {
  chrome.runtime.openOptionsPage();
}

function closePopup() {
  window.close();
}

function updatePlatformList(mode) {
  loadPlatforms();
}

function restoreState() {
  chrome.storage.local.get(['contentMode', 'selectedPlatforms'], result => {
    if (result.contentMode) {
      state.contentMode = result.contentMode;
    }
    if (result.selectedPlatforms) {
      state.selectedPlatforms = result.selectedPlatforms;
    }
  });
}

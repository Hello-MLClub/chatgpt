// 使用新的提取器更新popup.js

const state = {
  contentMode: 'article',
  selectedPlatforms: [],
  currentContent: null,
  syncInProgress: false
};

document.addEventListener('DOMContentLoaded', initPopup);

function initPopup() {
  setupEventListeners();
  loadPlatforms();
  restoreState();
  loadContentFromPage(); // 立即一键提取当前页面内容
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

// 一键提取当前页面的所有内容
async function loadContentFromPage() {
  const btn = document.getElementById('fetchBtn');
  btn.textContent = '正在提取内容...';
  btn.disabled = true;
  
  try {
    // 使用content script钨取数据
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractContent' }, response => {
        if (response && response.success) {
          state.currentContent = response.data;
          displayExtractedContent(response.data);
          btn.textContent = '筈新提取';
        }
        btn.disabled = false;
      });
    });
  } catch (error) {
    console.error('提取错误:', error);
    btn.textContent = '获取内容';
    btn.disabled = false;
  }
}

// 显示提取的内容
function displayExtractedContent(content) {
  // 显示标题
  if (content.title) {
    document.getElementById('previewTitle').value = content.title;
  }
  
  // 显示Markdown格式
  if (content.markdown) {
    document.getElementById('previewSummary').value = content.markdown;
  } else if (content.text) {
    document.getElementById('previewSummary').value = content.text;
  }
  
  // 显示图片
  if (content.images && content.images.length > 0) {
    const container = document.getElementById('previewImages');
    container.innerHTML = '';
    content.images.slice(0, 9).forEach(img => {
      const imgEl = document.createElement('img');
      imgEl.src = img.url;
      imgEl.alt = img.alt || '图片';
      imgEl.style.cursor = 'pointer';
      imgEl.title = '点击查看原图';
      container.appendChild(imgEl);
    });
  }
  
  // 显示其他信息
  if (content.author) {
    const authorEl = document.querySelector('[data-field="author"]');
    if (authorEl) authorEl.value = content.author;
  }
  
  if (content.url) {
    const urlEl = document.querySelector('[data-field="url"]');
    if (urlEl) urlEl.value = content.url;
  }
  
  // 显示预览区域
  document.getElementById('contentPreview').classList.remove('hidden');
  document.getElementById('syncBtn').disabled = false;
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
    label.innerHTML = `
      <input type="checkbox" value="${platform.id}" data-platform="${platform.id}">
      <span class="platform-name">${platform.name}</span>
      <span class="platform-icon">${platform.icon}</span>
    `;
    container.appendChild(label);
  });

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

function fetchContent() {
  loadContentFromPage();
}

function displayContentPreview(content) {
  document.getElementById('contentPreview').classList.remove('hidden');
  document.getElementById('previewTitle').value = content.title || '';
  document.getElementById('previewSummary').value = content.markdown || content.text || '';
  document.getElementById('syncBtn').disabled = false;
}

function resetContentPreview() {
  document.getElementById('contentPreview').classList.add('hidden');
  document.getElementById('contentUrl').value = '';
  document.getElementById('syncBtn').disabled = true;
}

async function startSync() {
  if (!state.currentContent || state.selectedPlatforms.length === 0) {
    alert('请先提取内容并选择平台');
    return;
  }

  state.syncInProgress = true;
  document.getElementById('syncStatus').classList.remove('hidden');

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
    setTimeout(() => {
      resolve({
        platform: platformId,
        success: Math.random() > 0.1,
        message: `${getPlatformName(platformId)} - 同步完成`
      });
    }, 1000);
  });
}

function updateSyncLog(result) {
  const log = document.getElementById('syncLog');
  const entry = document.createElement('div');
  entry.className = `log-entry ${result.success ? 'success' : 'error'}`;
  entry.innerHTML = `<span>${result.message}</span>`;
  log.appendChild(entry);
}

function showSyncComplete(results) {
  const successful = results.filter(r => r.success).length;
  alert(`同步完成！成功: ${successful}/${results.length}`);
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

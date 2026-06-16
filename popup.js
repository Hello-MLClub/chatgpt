// 状态管理
const state = {
  contentMode: 'article',
  selectedPlatforms: [],
  currentContent: null,
  syncInProgress: false
};

// 初始化
document.addEventListener('DOMContentLoaded', initPopup);

function initPopup() {
  setupEventListeners();
  loadPlatforms();
  restoreState();
}

function setupEventListeners() {
  // 模式切换
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', switchContentMode);
  });

  // 获取内容
  document.getElementById('fetchBtn').addEventListener('click', fetchContent);

  // 平台选择
  document.addEventListener('change', handlePlatformToggle);

  // 同步
  document.getElementById('syncBtn').addEventListener('click', startSync);
  document.getElementById('cancelBtn').addEventListener('click', closePopup);

  // 设置
  document.getElementById('settingsBtn').addEventListener('click', openSettings);

  // 获取当前页面内容
  document.getElementById('contentUrl').addEventListener('focus', autoFillCurrentPage);
}

function switchContentMode(e) {
  const mode = e.target.dataset.mode;
  state.contentMode = mode;

  // UI 更新
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  // 清空内容
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
  document.getElementById('syncBtn').disabled = selected === 0;
}

function fetchContent() {
  const input = document.getElementById('contentUrl').value.trim();
  if (!input) {
    alert('请输入链接或标题');
    return;
  }

  // 模拟获取内容
  state.currentContent = {
    title: input,
    summary: '这是文章的摘要内容...',
    images: [],
    url: input,
    mode: state.contentMode
  };

  displayContentPreview(state.currentContent);
}

function displayContentPreview(content) {
  document.getElementById('contentPreview').classList.remove('hidden');
  document.getElementById('previewTitle').value = content.title;
  document.getElementById('previewSummary').value = content.summary;
  document.getElementById('syncBtn').disabled = false;
}

function resetContentPreview() {
  document.getElementById('contentPreview').classList.add('hidden');
  document.getElementById('contentUrl').value = '';
  document.getElementById('syncBtn').disabled = true;
}

async function startSync() {
  if (!state.currentContent || state.selectedPlatforms.length === 0) {
    alert('请先选择平台和内容');
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
    // 模拟同步过程
    setTimeout(() => {
      resolve({
        platform: platformId,
        success: Math.random() > 0.1,
        message: `${platformId} - 同步完成`
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

function autoFillCurrentPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) {
      document.getElementById('contentUrl').value = tabs[0].url;
    }
  });
}

function openSettings() {
  chrome.runtime.openOptionsPage();
}

function closePopup() {
  window.close();
}

function updatePlatformList(mode) {
  // 根据模式更新平台列表
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

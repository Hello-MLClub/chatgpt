// 初始化选项页
document.addEventListener('DOMContentLoaded', initOptions);

function initOptions() {
  loadSettings();
  setupEventListeners();
  renderPlatformSettings();
}

function setupEventListeners() {
  // 保存设置
  document.getElementById('saveBtn').addEventListener('click', saveSettings);

  // 数据管理
  document.getElementById('exportBtn').addEventListener('click', exportSettings);
  document.getElementById('importBtn').addEventListener('click', importSettings);
  document.getElementById('clearBtn').addEventListener('click', clearAllData);

  // 实时保存切换按钮
  document.querySelectorAll('.setting-toggle').forEach(toggle => {
    toggle.addEventListener('change', saveSettings);
  });
}

function loadSettings() {
  chrome.storage.local.get(null, items => {
    // 加载切换开关
    if (items.autoExtract !== undefined) {
      document.getElementById('autoExtract').checked = items.autoExtract;
    }
    if (items.autoFill !== undefined) {
      document.getElementById('autoFill').checked = items.autoFill;
    }
    if (items.notifySync !== undefined) {
      document.getElementById('notifySync').checked = items.notifySync;
    }

    // 加载数值设置
    if (items.syncTimeout) {
      document.getElementById('syncTimeout').value = items.syncTimeout;
    }
    if (items.batchSize) {
      document.getElementById('batchSize').value = items.batchSize;
    }
    if (items.maxRetry) {
      document.getElementById('maxRetry').value = items.maxRetry;
    }
  });
}

function saveSettings() {
  const settings = {
    autoExtract: document.getElementById('autoExtract').checked,
    autoFill: document.getElementById('autoFill').checked,
    notifySync: document.getElementById('notifySync').checked,
    syncTimeout: parseInt(document.getElementById('syncTimeout').value),
    batchSize: parseInt(document.getElementById('batchSize').value),
    maxRetry: parseInt(document.getElementById('maxRetry').value),
    lastSaved: new Date().toISOString()
  };

  chrome.storage.local.set(settings, () => {
    showSaveStatus('✅ 设置已保存');
    setTimeout(() => showSaveStatus(''), 2000);
  });
}

function renderPlatformSettings() {
  const container = document.getElementById('platformSettings');
  const platforms = getAllPlatforms();

  platforms.forEach(platform => {
    const item = document.createElement('div');
    item.className = 'platform-setting-item';
    item.innerHTML = `
      <div class="platform-info">
        <span class="platform-icon">${platform.icon}</span>
        <span class="platform-name">${platform.name}</span>
      </div>
      <div class="platform-controls">
        <input type="checkbox" class="platform-enabled" data-platform="${platform.id}" 
          ${platform.enabled ? 'checked' : ''}>
        <span class="platform-status">${platform.enabled ? '已启用' : '已禁用'}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

function exportSettings() {
  chrome.storage.local.get(null, items => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aibeike-settings-${new Date().getTime()}.json`;
    link.click();
  });
}

function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target.result);
        chrome.storage.local.set(data, () => {
          showSaveStatus('✅ 设置已导入');
          setTimeout(() => location.reload(), 1000);
        });
      } catch (error) {
        alert('导入失败，文件格式不正确');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearAllData() {
  if (confirm('确定要清除所有数据吗？此操作无法撤销。')) {
    chrome.storage.local.clear(() => {
      showSaveStatus('✅ 数据已清除');
      setTimeout(() => location.reload(), 1000);
    });
  }
}

function showSaveStatus(message) {
  const status = document.getElementById('saveStatus');
  status.textContent = message;
}

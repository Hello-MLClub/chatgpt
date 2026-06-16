// 后台服务工作者

// 监听扩展安装
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncContent') {
    handleSync(request.data, sender.tab.id).then(sendResponse);
    return true; // 异步响应
  }
  
  if (request.action === 'extractContent') {
    extractContentFromTab(sender.tab).then(sendResponse);
    return true;
  }
});

async function handleSync(data, tabId) {
  try {
    const results = [];
    for (const platform of data.platforms) {
      const result = await syncToPlatform(platform, data.content, tabId);
      results.push(result);
    }
    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function syncToPlatform(platform, content, tabId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        platform,
        success: true,
        timestamp: new Date().toISOString()
      });
    }, 2000);
  });
}

async function extractContentFromTab(tab) {
  return {
    url: tab.url,
    title: tab.title,
    timestamp: new Date().toISOString()
  };
}

// 定期清理日志
chrome.alarms.create('cleanupLogs', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'cleanupLogs') {
    cleanupOldLogs();
  }
});

function cleanupOldLogs() {
  chrome.storage.local.get(['syncLogs'], result => {
    if (result.syncLogs) {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const filtered = result.syncLogs.filter(log => 
        new Date(log.timestamp) > oneWeekAgo
      );
      chrome.storage.local.set({ syncLogs: filtered });
    }
  });
}

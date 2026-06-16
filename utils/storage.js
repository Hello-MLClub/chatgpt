// 本地存储管理

class StorageManager {
  static async save(key, value) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  static async get(key, defaultValue = null) {
    return new Promise(resolve => {
      chrome.storage.get([key], result => {
        resolve(result[key] ?? defaultValue);
      });
    });
  }

  static async getAll() {
    return new Promise(resolve => {
      chrome.storage.local.get(null, resolve);
    });
  }

  static async clear() {
    return new Promise(resolve => {
      chrome.storage.local.clear(resolve);
    });
  }

  static async remove(keys) {
    return new Promise(resolve => {
      chrome.storage.local.remove(keys, resolve);
    });
  }

  // 同步日志
  static async addSyncLog(log) {
    const logs = await this.get('syncLogs', []);
    logs.push({
      ...log,
      timestamp: new Date().toISOString()
    });
    await this.save('syncLogs', logs.slice(-100)); // 只保留最近100条
  }

  // 获取同步历史
  static async getSyncHistory(limit = 20) {
    const logs = await this.get('syncLogs', []);
    return logs.slice(-limit).reverse();
  }
}

// 导出使用
const storage = StorageManager;

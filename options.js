import { PLATFORM_DEFAULTS } from './viralTopic.js';

const credentialKeys = ['youtubeApiKey', 'twitterApiKey', 'wechatApiBase', 'wechatAppId', 'wechatAppSecret', 'wechatAccessToken'];
const optionFields = {
  youtube: { days: 'youtubeDays', minViews: 'youtubeMinViews', regionCode: 'youtubeRegionCode' },
  bilibili: { days: 'bilibiliDays', maxFollowers: 'bilibiliMaxFollowers', minPlay: 'bilibiliMinPlay', minPlayFollowerRatio: 'bilibiliMinPlayFollowerRatio' },
  x: { days: 'xDays', maxFollowers: 'xMaxFollowers', minEngagement: 'xMinEngagement', minViews: 'xMinViews' },
  wechat: { days: 'wechatDays', minRead: 'wechatMinRead', minReadMonthAvgRatio: 'wechatMinReadMonthAvgRatio' }
};
const keys = [...credentialKeys, 'platformOptions'];
const $ = (id) => document.getElementById(id);

loadSettings();
$('settingsForm').addEventListener('submit', saveSettings);
$('reset').addEventListener('click', resetDefaults);
$('testConfig').addEventListener('click', renderConfigCheck);

async function loadSettings() {
  const values = await chrome.storage.local.get(keys);
  credentialKeys.forEach((key) => { $(key).value = values[key] || ''; });
  fillOptionFields({ ...PLATFORM_DEFAULTS, ...(values.platformOptions || {}) });
}

async function saveSettings(event) {
  event.preventDefault();
  const credentials = Object.fromEntries(credentialKeys.map((key) => [key, $(key).value.trim()]));
  const platformOptions = readOptionFields();
  await chrome.storage.local.set({ ...credentials, platformOptions });
  setStatus('已保存。新的平台阈值会在下一次搜索时生效。');
}

function resetDefaults() {
  fillOptionFields(PLATFORM_DEFAULTS);
  setStatus('已恢复默认阈值，点击保存后生效。');
}

function fillOptionFields(options) {
  for (const [platform, fields] of Object.entries(optionFields)) {
    for (const [optionKey, elementId] of Object.entries(fields)) {
      $(elementId).value = options[platform]?.[optionKey] ?? '';
    }
  }
}

function readOptionFields() {
  const platformOptions = {};
  for (const [platform, fields] of Object.entries(optionFields)) {
    platformOptions[platform] = {};
    for (const [optionKey, elementId] of Object.entries(fields)) {
      const rawValue = $(elementId).value.trim();
      platformOptions[platform][optionKey] = optionKey === 'regionCode' ? rawValue.toUpperCase() : Number(rawValue || 0);
    }
  }
  return platformOptions;
}

function renderConfigCheck() {
  const checks = [
    ['YouTube', $('youtubeApiKey').value.trim()],
    ['X/Twitter', $('twitterApiKey').value.trim()],
    ['WeChat API Base', $('wechatApiBase').value.trim()],
    ['WeChat Token/App Secret', $('wechatAccessToken').value.trim() || $('wechatAppSecret').value.trim()]
  ];
  const missing = checks.filter(([, value]) => !value).map(([label]) => label);
  setStatus(missing.length ? `仍缺少：${missing.join('、')}。缺少凭据的平台可继续使用离线 JSON。` : '配置项已填写完整。');
}

function setStatus(text) {
  $('status').textContent = text;
}

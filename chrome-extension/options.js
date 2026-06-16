const keys = ['youtubeApiKey', 'twitterApiKey', 'wechatApiBase', 'wechatAppId', 'wechatAppSecret', 'wechatAccessToken'];
const $ = (id) => document.getElementById(id);
chrome.storage.local.get(keys).then((values) => keys.forEach((key) => { $(key).value = values[key] || ''; }));
$('save').addEventListener('click', async () => { const values = Object.fromEntries(keys.map((key) => [key, $(key).value.trim()])); await chrome.storage.local.set(values); $('status').textContent = '已保存到浏览器本地。'; });

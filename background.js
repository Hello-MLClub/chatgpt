import { PLATFORM_DEFAULTS, splitTerms, normalizeImportedRecord, filterAndRank, asNumber, freshnessScore } from './viralTopic.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'RUN_SEARCH') return false;
  runSearch(message.payload).then(sendResponse).catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

async function runSearch(payload) {
  const settings = await chrome.storage.local.get(['youtubeApiKey', 'twitterApiKey', 'wechatApiBase', 'wechatAppId', 'wechatAppSecret', 'wechatAccessToken', 'platformOptions']);
  const platforms = payload.platforms?.length ? payload.platforms : ['wechat', 'x', 'bilibili', 'youtube'];
  const imported = parseImported(payload.importJson);
  const results = [];
  const statuses = [];
  for (const platform of platforms) {
    try {
      const options = getPlatformOptions(platform, payload, settings);
      const platformResults = imported.length ? filterAndRank(imported.map((item) => normalizeImportedRecord(item, item.platform || platform)), platform, options).slice(0, payload.limit || 25) : await collectPlatform(platform, payload, settings, options);
      results.push(...platformResults);
      statuses.push({ platform, ok: true, count: platformResults.length, message: imported.length ? '来自离线 JSON' : '实时搜索完成' });
    } catch (error) {
      statuses.push({ platform, ok: false, count: 0, message: error.message });
    }
  }
  results.sort((a, b) => (b.breakout_score - a.breakout_score) || (b.hot_score - a.hot_score));
  return { ok: true, runAt: new Date().toISOString(), results: results.slice(0, payload.limit || 25), statuses };
}

function parseImported(text) {
  if (!text?.trim()) return [];
  const payload = JSON.parse(text);
  if (Array.isArray(payload)) return payload;
  for (const key of ['results', 'items', 'videos', 'data']) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') {
      for (const nested of ['results', 'items']) if (Array.isArray(value[nested])) return value[nested];
    }
  }
  return [];
}

function getPlatformOptions(platform, payload, settings) {
  return { ...PLATFORM_DEFAULTS[platform], ...settings.platformOptions?.[platform], ...payload.options?.[platform] };
}

async function collectPlatform(platform, payload, settings, options) {
  if (platform === 'youtube') return searchYouTube(payload, settings, options);
  if (platform === 'bilibili') return searchBilibili(payload, options);
  if (platform === 'x') throw new Error('请在设置中填写 twitterapi.io Key；不同套餐端点可能不同，当前扩展保留离线 JSON 与配置提示。');
  if (platform === 'wechat') throw new Error('请配置 WECHAT_HOT_API_BASE/凭据；该 API 为私有部署，建议先粘贴脚本 JSON 输出。');
  return [];
}

async function searchYouTube(payload, settings, options) {
  if (!settings.youtubeApiKey) throw new Error('缺少 YouTube Data API Key。');
  const after = new Date(Date.now() - asNumber(options.days, 30) * 86400000).toISOString();
  const ids = new Map();
  for (const q of splitTerms(payload.topic)) {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    Object.entries({ key: settings.youtubeApiKey, part: 'snippet', type: 'video', q, order: 'viewCount', publishedAfter: after, maxResults: 25, regionCode: options.regionCode || 'US' }).forEach(([k, v]) => url.searchParams.set(k, v));
    const json = await fetchJson(url);
    for (const item of json.items || []) if (item.id?.videoId) ids.set(item.id.videoId, q);
  }
  if (!ids.size) return [];
  const videoJson = await fetchJson(new URL(`https://www.googleapis.com/youtube/v3/videos?key=${encodeURIComponent(settings.youtubeApiKey)}&part=snippet,statistics,contentDetails&id=${encodeURIComponent([...ids.keys()].join(','))}`));
  const channelIds = [...new Set((videoJson.items || []).map((v) => v.snippet?.channelId).filter(Boolean))];
  const channelJson = channelIds.length ? await fetchJson(new URL(`https://www.googleapis.com/youtube/v3/channels?key=${encodeURIComponent(settings.youtubeApiKey)}&part=snippet,statistics&id=${encodeURIComponent(channelIds.join(','))}`)) : { items: [] };
  const channels = new Map((channelJson.items || []).map((c) => [c.id, c]));
  return filterAndRank((videoJson.items || []).map((video) => normalizeYouTube(video, channels.get(video.snippet?.channelId), ids.get(video.id), options)), 'youtube', options).slice(0, payload.limit || 25);
}

function normalizeYouTube(video, channel = {}, sourceQuery, options) {
  const stats = video.statistics || {};
  const cstats = channel.statistics || {};
  const views = asNumber(stats.viewCount), likes = asNumber(stats.likeCount), comments = asNumber(stats.commentCount);
  const subscribers = cstats.hiddenSubscriberCount ? null : asNumber(cstats.subscriberCount, null);
  const likeRate = likes / Math.max(views, 1);
  const viralScore = Math.log1p(views) * 0.45 + Math.log1p(likes + comments * 2) * 0.25 + Math.min(100, likeRate * 1000) * 0.12 + freshnessScore(video.snippet?.publishedAt, options.days) * 0.1;
  return normalizeImportedRecord({ platform: 'youtube', content_id: video.id, url: `https://www.youtube.com/watch?v=${video.id}`, title: video.snippet?.title, author_name: video.snippet?.channelTitle, subscriber_count: subscribers, published_at: video.snippet?.publishedAt, view_count: views, like_count: likes, comment_count: comments, viral_score: viralScore, evidence: [`source_query:${sourceQuery}`, `high_views:${views}`] }, 'youtube');
}

async function searchBilibili(payload, options) {
  const output = [];
  for (const keyword of splitTerms(payload.topic)) {
    const url = new URL('https://api.bilibili.com/x/web-interface/search/type');
    Object.entries({ search_type: 'video', keyword, order: 'click', page: 1 }).forEach(([k, v]) => url.searchParams.set(k, v));
    const json = await fetchJson(url);
    for (const item of json.data?.result || []) output.push(normalizeImportedRecord({ platform: 'bilibili', content_id: item.bvid, url: item.arcurl || `https://www.bilibili.com/video/${item.bvid}`, title: stripHtml(item.title), author_name: item.author, follower_count: item.follower_count, published_at: item.pubdate ? new Date(item.pubdate * 1000).toISOString() : '', view_count: item.play, like_count: item.like, comment_count: item.review, save_count: item.favorites, hot_score: asNumber(item.play) + asNumber(item.like) * 20, breakout_score: asNumber(item.play) / Math.max(asNumber(item.follower_count, 100000), 1), evidence: [`source_query:${keyword}`] }, 'bilibili'));
  }
  return filterAndRank(output, 'bilibili', options).slice(0, payload.limit || 25);
}

async function fetchJson(url) {
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`.slice(0, 240));
  return response.json();
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, '');
}

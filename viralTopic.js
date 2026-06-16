export const PLATFORM_DEFAULTS = {
  wechat: { days: 7, minRead: 10000, minReadMonthAvgRatio: 2 },
  x: { days: 7, maxFollowers: 50000, minEngagement: 100, minViews: 0 },
  bilibili: { days: 30, maxFollowers: 100000, minPlay: 10000, minPlayFollowerRatio: 2 },
  youtube: { days: 30, minViews: 10000, minEngagement: 0, regionCode: 'US' }
};

export const PLATFORM_LABELS = { wechat: 'WeChat', x: 'X/Twitter', bilibili: 'Bilibili', youtube: 'YouTube' };

export function splitTerms(topic) {
  return String(topic || '').replace(/，/g, ',').split(',').map((item) => item.trim()).filter(Boolean).slice(0, 10);
}

export function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function freshnessScore(publishedAt, days) {
  const time = Date.parse(publishedAt);
  if (!Number.isFinite(time) || days <= 0) return 0;
  const ageDays = Math.max(0, (Date.now() - time) / 86400000);
  return Math.max(0, Math.min(100, (1 - ageDays / days) * 100));
}

export function normalizeImportedRecord(record, platformHint = '') {
  const platform = record.platform || platformHint || 'unknown';
  const views = asNumber(record.view_count ?? record.views ?? record.read_num ?? record.play, 0);
  const likes = asNumber(record.like_count ?? record.likes, 0);
  const comments = asNumber(record.comment_count ?? record.comments, 0);
  const shares = asNumber(record.share_count ?? record.shares, 0);
  const saves = asNumber(record.save_count ?? record.favorites ?? record.bookmarks, 0);
  const followers = record.follower_count ?? record.subscriber_count ?? record.author_followers ?? null;
  const engagement = likes + comments * 2 + shares * 3 + saves * 2;
  const hotScore = asNumber(record.hot_score, views + likes * 20 + comments * 40 + shares * 60 + saves * 30);
  const breakoutScore = asNumber(record.breakout_score ?? record.viral_score, hotScore / Math.max(asNumber(followers, 1000), 1000));
  return {
    platform,
    content_id: record.content_id || record.id || record.bvid || record.video_id || '',
    url: record.url || record.content_url || '',
    title: record.title || record.text || record.desc || '(untitled)',
    author_name: record.author_name || record.author || record.channel_title || record.name || '',
    author_handle: record.author_handle || '',
    follower_count: followers,
    month_read_avg: record.month_read_avg ?? null,
    published_at: record.published_at || record.pubdate || record.created_at || '',
    view_count: views,
    like_count: likes,
    comment_count: comments,
    share_count: shares,
    save_count: saves,
    hot_score: Math.round(hotScore * 100) / 100,
    breakout_score: Math.round(breakoutScore * 100) / 100,
    evidence: Array.isArray(record.evidence) ? record.evidence : [],
    source_status: record.source_status || ''
  };
}

export function filterAndRank(items, platform, options = {}) {
  const defaults = PLATFORM_DEFAULTS[platform] || {};
  const config = { ...defaults, ...options };
  return items.filter((item) => {
    if (platform === 'youtube') return item.view_count >= asNumber(config.minViews, 10000);
    if (platform === 'x') {
      const followers = asNumber(item.follower_count, Infinity);
      const engagement = item.like_count + item.comment_count * 2 + item.share_count * 3 + item.save_count * 2;
      return followers <= asNumber(config.maxFollowers, 50000) && (item.view_count >= asNumber(config.minViews, 0) || engagement >= asNumber(config.minEngagement, 100));
    }
    if (platform === 'bilibili') {
      const followers = asNumber(item.follower_count, Infinity);
      return followers <= asNumber(config.maxFollowers, 100000) && item.view_count >= asNumber(config.minPlay, 10000) && item.view_count / Math.max(followers, 1) >= asNumber(config.minPlayFollowerRatio, 2);
    }
    if (platform === 'wechat') {
      const avg = asNumber(item.month_read_avg, 0);
      return item.view_count >= asNumber(config.minRead, 10000) && avg > 0 && item.view_count / avg >= asNumber(config.minReadMonthAvgRatio, 2);
    }
    return true;
  }).sort((a, b) => (b.breakout_score - a.breakout_score) || (b.hot_score - a.hot_score) || (b.view_count - a.view_count));
}

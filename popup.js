import { PLATFORM_LABELS } from './viralTopic.js';
const $ = (id) => document.getElementById(id);
$('options').addEventListener('click', () => chrome.runtime.openOptionsPage());
$('run').addEventListener('click', async () => {
  const topic = $('topic').value.trim();
  const platforms = [...document.querySelectorAll('.platforms input:checked')].map((item) => item.value);
  if (!topic && !$('importJson').value.trim()) return setStatus('请输入选题方向或离线 JSON。', true);
  setStatus('搜索中…');
  const response = await chrome.runtime.sendMessage({ type: 'RUN_SEARCH', payload: { topic, platforms, importJson: $('importJson').value, limit: 30 } });
  if (!response?.ok) return setStatus(response?.error || '搜索失败', true);
  render(response);
});
function setStatus(text, isError = false) { $('status').textContent = text; $('status').className = isError ? 'error' : ''; }
function render(response) {
  setStatus(`完成：${response.results.length} 条结果。`);
  const statusHtml = response.statuses.map((s) => `<li class="${s.ok ? '' : 'warn'}">${PLATFORM_LABELS[s.platform] || s.platform}: ${s.message} (${s.count})</li>`).join('');
  const rows = response.results.map((item) => `<article><div class="meta">${PLATFORM_LABELS[item.platform] || item.platform} · ${item.author_name || 'unknown'} · ${item.published_at || ''}</div><h2>${escapeHtml(item.title)}</h2><p>浏览/阅读/播放：${format(item.view_count)} · 粉丝/订阅：${item.follower_count ?? '未知'} · 分数：${item.breakout_score}</p><p class="evidence">${(item.evidence || []).map(escapeHtml).join('，')}</p>${item.url ? `<a href="${item.url}" target="_blank" rel="noreferrer">打开来源</a>` : ''}</article>`).join('');
  $('results').innerHTML = `<ul class="statuses">${statusHtml}</ul>${rows || '<p>没有匹配结果，请降低阈值或使用离线 JSON。</p>'}`;
}
function format(value) { return Number(value || 0).toLocaleString('zh-CN'); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])); }

import { buildArticlePackage, PLATFORM_LABELS } from './articleAssistant.js';
const $ = (id) => document.getElementById(id);
let latestMarkdown = '';
$('options').addEventListener('click', () => chrome.runtime.openOptionsPage());
$('run').addEventListener('click', () => {
  const payload = readPayload();
  if (!payload.title || !payload.content) return setStatus('请填写文章标题和正文。', true);
  const result = buildArticlePackage(payload);
  latestMarkdown = result.markdown;
  render(result);
  setStatus(`已生成：${result.platforms.length} 个平台发布建议。`);
});
$('copy').addEventListener('click', async () => {
  if (!latestMarkdown) return setStatus('请先生成发布包。', true);
  await navigator.clipboard.writeText(latestMarkdown);
  setStatus('发布包已复制到剪贴板。');
});
function readPayload() {
  return {
    title: $('title').value.trim(),
    content: $('content').value.trim(),
    audience: $('audience').value.trim(),
    keywords: $('keywords').value.split(/[,，]/).map((item) => item.trim()).filter(Boolean),
    platforms: [...document.querySelectorAll('.platforms input:checked')].map((item) => item.value)
  };
}
function setStatus(text, isError = false) { $('status').textContent = text; $('status').className = isError ? 'error' : ''; }
function render(result) {
  const overview = `<section class="card"><h2>发布总览</h2><p>${escapeHtml(result.summary)}</p><ul>${result.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`;
  const platformCards = result.platforms.map((item) => `<article><div class="meta">${PLATFORM_LABELS[item.platform] || item.platform} · ${item.lengthHint}</div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.intro)}</p><p><strong>标签：</strong>${item.tags.map(escapeHtml).join('、')}</p><p class="evidence">${escapeHtml(item.note)}</p></article>`).join('');
  $('results').innerHTML = `${overview}${platformCards}`;
}
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

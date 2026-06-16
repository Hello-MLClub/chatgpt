export const PLATFORM_LABELS = {
  wechat: '微信公众号',
  zhihu: '知乎',
  xiaohongshu: '小红书',
  toutiao: '头条号',
  juejin: '掘金 / CSDN',
  medium: 'Medium'
};

const PLATFORM_RULES = {
  wechat: { suffix: '：完整复盘', lengthHint: '适合长文深读', tagCount: 4, note: '保留 Markdown 层级，重点检查封面、摘要与首屏吸引力。' },
  zhihu: { suffix: '？我的实测和建议', lengthHint: '适合问答/经验文', tagCount: 5, note: '开头先给结论，再展开背景、步骤和避坑。' },
  xiaohongshu: { suffix: '｜效率工具实测', lengthHint: '适合短标题+清单', tagCount: 6, note: '拆成短段落，补充 3-5 张图，标签口语化。' },
  toutiao: { suffix: '，自媒体人该不该用', lengthHint: '适合资讯/观点文', tagCount: 4, note: '标题突出痛点和收益，正文增加小标题提升完读。' },
  juejin: { suffix: '：从流程到落地清单', lengthHint: '适合技术/教程文', tagCount: 5, note: '保留代码块和步骤，突出工具链、格式兼容与可复用模板。' },
  medium: { suffix: ': A Practical Publishing Workflow', lengthHint: '适合英文摘要/国际分发', tagCount: 5, note: '建议补充英文标题、摘要和跨平台分发背景。' }
};

export function buildArticlePackage({ title, content, audience, keywords = [], platforms = [] }) {
  const cleanTitle = compact(title);
  const text = stripMarkdown(content);
  const summary = summarize(text, audience, keywords);
  const baseTags = normalizeTags(keywords, audience);
  const selected = platforms.length ? platforms : ['wechat', 'zhihu', 'xiaohongshu'];
  const platformPackages = selected.map((platform) => buildPlatform(platform, cleanTitle, summary, baseTags));
  const checklist = buildChecklist(content, selected);
  return { summary, checklist, platforms: platformPackages, markdown: toMarkdown(cleanTitle, summary, checklist, platformPackages) };
}

function buildPlatform(platform, title, summary, baseTags) {
  const rule = PLATFORM_RULES[platform] || { suffix: '', lengthHint: '通用发布', tagCount: 4, note: '发布前检查排版、图片和链接。' };
  const tags = [...new Set([...baseTags, PLATFORM_LABELS[platform], '内容同步', '多平台分发'].filter(Boolean))].slice(0, rule.tagCount);
  return { platform, title: `${title}${rule.suffix}`, intro: summary, tags, lengthHint: rule.lengthHint, note: rule.note };
}

function summarize(text, audience, keywords) {
  const firstSentence = compact(text).split(/[。！？.!?]/).find(Boolean) || '围绕内容创作、同步分发和运营效率整理发布方案';
  const keywordText = keywords.length ? `，关键词包括 ${keywords.slice(0, 4).join('、')}` : '';
  const audienceText = audience ? `面向${audience}` : '面向多平台内容创作者';
  return `${audienceText}${keywordText}。核心摘要：${firstSentence.slice(0, 90)}。`;
}

function buildChecklist(content, platforms) {
  const hasMarkdownHeading = /^#{1,3}\s+/m.test(content);
  const hasImage = /!\[[^\]]*\]\(|<img\b/i.test(content);
  return [
    hasMarkdownHeading ? '正文已包含 Markdown 标题层级，发布前确认各平台格式一致。' : '建议补充 2-4 个小标题，方便同步到长文平台。',
    hasImage ? '正文包含图片，发布前检查封面、正文图和版权。' : '建议准备封面图和 2-5 张配图，提升小红书/头条点击率。',
    '在浏览器中提前登录目标平台账号，插件只辅助填充，不保存账号密码。',
    `本次选择 ${platforms.length} 个平台，发布前逐页预览并手动确认发布按钮。`,
    '保留原文链接、作者署名和必要声明，避免跨平台搬运风险。'
  ];
}

function normalizeTags(keywords, audience) {
  return [...keywords, audience].flatMap((item) => String(item || '').split(/[\s,，/]+/)).map((item) => item.replace(/^#/, '').trim()).filter(Boolean);
}
function stripMarkdown(value) { return String(value || '').replace(/```[\s\S]*?```/g, '').replace(/[#>*_`\-[\]()]/g, ' '); }
function compact(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function toMarkdown(title, summary, checklist, platforms) {
  return [`# ${title} 发布包`, '', `## 摘要`, summary, '', '## 发布前检查', ...checklist.map((item) => `- ${item}`), '', '## 平台建议', ...platforms.flatMap((item) => ['', `### ${PLATFORM_LABELS[item.platform] || item.platform}`, `- 标题：${item.title}`, `- 导语：${item.intro}`, `- 标签：${item.tags.join('、')}`, `- 注意：${item.note}`])].join('\n');
}

# API 配置文档

## 内容提取 API

### ContentExtractor 类

```javascript
// 指人例:
const extractor = new ContentExtractor();

// 提取文本
extractor.extractText()  // 返回皱文本

// 提取标题
extractor.extractTitle()  // 返回标题

// 提取描述
extractor.extractDescription()  // 返回元描述

// 提取所有图片
extractor.extractImages()  // 返回图片URL数组

// 提取为Markdown
const markdown = await extractor.extractMarkdown()  // 返回正形Markdown格式

// 今HTML为Markdown
const md = extractor.convertToMarkdown(htmlString)
```

### PlatformExtractors 对象

```javascript
// 提取当前页面内容
const content = await extractCurrentPageContent();

/* 返回结构：
{
  title: '文章标题',
  author: '作者名称',
  content: 'HTML桌容',
  text: '纯文本内容',
  markdown: 'Markdown格式内容',
  images: [
    { url: 'http://...', alt: '嚾述' }
  ],
  tags: ['标签1', '标签2'],
  likes: '100',
  comments: '50',
  url: 'https://...'
}
*/
```

## 支持的平台

### 已应成的提取器

1. **微信公众号** (wechat)
   - 阎需字段: title, author, content, text, markdown, publishDate, views

2. **知乎** (zhihu)
   - 阎需字段: title, author, content, text, markdown, likes, comments

3. **小红书** (xiaohongshu)
   - 阎需字段: title, author, content, text, markdown, likes, shares

4. **接据** (juejin)
   - 阎需字段: title, author, content, text, markdown, category, tags

5. **CSDN** (csdn)
   - 阎需字段: title, author, content, text, markdown, category, views

6. **B站** (bilibili)
   - 阎需字段: title, author, description, tags, views, duration

7. **抖音** (douyin)
   - 阎需字段: description, author, hashtags, likes, comments, shares

### 通用提取器

- 会自动检测不在列表中的任何网站
- 返回基本信息: title, text, markdown, images, url, description

## 提供新的平台提取器

在 `utils/platformExtractors.js` 中添加:

```javascript
const PlatformExtractors = {
  // ...
  myplatform: {
    detect: () => window.location.hostname.includes('myplatform.com'),
    extract: async () => {
      return {
        title: document.querySelector('h1')?.innerText || '',
        content: document.querySelector('.content')?.innerHTML || '',
        text: document.querySelector('.content')?.innerText || '',
        // ...添加更多字段
      };
    }
  }
};
```

## Markdown 转换规则

- `<h1>...</h1>` → `# ...​`
- `<h2>...</h2>` → `## ...`
- `<strong>` / `<b>` → `**...**`
- `<em>` / `<i>` → `*...*`
- `<a href="...">` → `[...](url)`
- `<img>` → `![alt](url)`
- `<ul>` → `- ...`
- `<ol>` → `1. ...`
- `<code>` → `` `...` ``
- `<pre>` → `\`\`\` ... \`\`\``
- `<blockquote>` → `> ...`

## 使用示例

```javascript
// 在popup中使用
async function demo() {
  const content = await extractCurrentPageContent();
  
  console.log('标题:', content.title);
  console.log('Markdown:', content.markdown);
  console.log('图片:', content.images);
}

// 指定平台提取
const zhihuContent = await PlatformExtractors.zhihu.extract();
const wechatContent = await PlatformExtractors.wechat.extract();
```

## 调试技巧

1. 打开会声揰 (F12)
2. 处萃 -> 推扩 -> 选择你的扩展 -> 查看Service Worker上游输
3. 打印输出内容提取的数据

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('会声揰：', request);
  // ...
});
```

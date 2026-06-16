// 平台特定提取器

const PlatformExtractors = {
  // 微信公众号
  wechat: {
    detect: () => window.location.hostname.includes('mp.weixin.qq.com'),
    extract: async () => {
      const article = document.querySelector('#js_article') || document.body;
      return {
        title: document.querySelector('#activity-name')?.innerText || document.title,
        author: document.querySelector('#js_name')?.innerText || '',
        content: document.querySelector('#js_content')?.innerHTML || '',
        text: document.querySelector('#js_content')?.innerText || '',
        images: Array.from(document.querySelectorAll('#js_content img')).map(img => ({
          url: img.src || img.dataset.src,
          alt: img.alt || ''
        })),
        markdown: await ContentExtractor.extractMarkdown(),
        publishDate: document.querySelector('#publish_time')?.innerText || '',
        views: document.querySelector('#js_read_stat')?.innerText || ''
      };
    }
  },

  // 知乎
  zhihu: {
    detect: () => window.location.hostname.includes('zhihu.com'),
    extract: async () => {
      return {
        title: document.querySelector('h1')?.innerText || document.title,
        author: document.querySelector('[data-testid="author"]')?.innerText || '',
        content: document.querySelector('[data-testid="richTextContent"]')?.innerHTML || '',
        text: document.querySelector('[data-testid="richTextContent"]')?.innerText || '',
        images: Array.from(document.querySelectorAll('img[src*="zhimg"]')).map(img => ({
          url: img.src,
          alt: img.alt || ''
        })),
        markdown: await ContentExtractor.extractMarkdown(),
        likes: document.querySelector('[data-testid="voteCount"]')?.innerText || '',
        comments: document.querySelector('[data-testid="commentCount"]')?.innerText || ''
      };
    }
  },

  // 小红书
  xiaohongshu: {
    detect: () => window.location.hostname.includes('xiaohongshu.com'),
    extract: async () => {
      const container = document.querySelector('[class*="container"]') || document.body;
      return {
        title: document.querySelector('[class*="title"]')?.innerText || document.title,
        author: document.querySelector('[class*="author"]')?.innerText || '',
        content: container.innerHTML,
        text: container.innerText,
        images: Array.from(document.querySelectorAll('img[src*="xhscdn"]')).map(img => ({
          url: img.src,
          alt: img.alt || ''
        })),
        markdown: await ContentExtractor.extractMarkdown(),
        likes: document.querySelector('[class*="like"]')?.innerText || '',
        shares: document.querySelector('[class*="share"]')?.innerText || ''
      };
    }
  },

  // 接据
  juejin: {
    detect: () => window.location.hostname.includes('juejin.cn'),
    extract: async () => {
      return {
        title: document.querySelector('h1')?.innerText || document.title,
        author: document.querySelector('[data-testid="author-info"] span')?.innerText || '',
        content: document.querySelector('.markdown-body')?.innerHTML || '',
        text: document.querySelector('.markdown-body')?.innerText || '',
        images: Array.from(document.querySelectorAll('.markdown-body img')).map(img => ({
          url: img.src,
          alt: img.alt || ''
        })),
        markdown: await ContentExtractor.extractMarkdown(),
        category: document.querySelector('[class*="category"]')?.innerText || '',
        tags: Array.from(document.querySelectorAll('[class*="tag"]')).map(t => t.innerText)
      };
    }
  },

  // CSDN
  csdn: {
    detect: () => window.location.hostname.includes('csdn.net'),
    extract: async () => {
      return {
        title: document.querySelector('h1')?.innerText || document.title,
        author: document.querySelector('.blog-author-box .avatar-container')?.nextElementSibling?.innerText || '',
        content: document.querySelector('.blog-content-box')?.innerHTML || '',
        text: document.querySelector('.blog-content-box')?.innerText || '',
        images: Array.from(document.querySelectorAll('.blog-content-box img')).map(img => ({
          url: img.src,
          alt: img.alt || ''
        })),
        markdown: await ContentExtractor.extractMarkdown(),
        category: document.querySelector('.tag-link')?.innerText || '',
        views: document.querySelector('.read-count')?.innerText || ''
      };
    }
  },

  // B站
  bilibili: {
    detect: () => window.location.hostname.includes('bilibili.com'),
    extract: async () => {
      return {
        title: document.querySelector('h1')?.innerText || document.title,
        author: document.querySelector('.up-name')?.innerText || '',
        description: document.querySelector('[class*="description"]')?.innerText || '',
        images: Array.from(document.querySelectorAll('img[src*="bilibili"]')).map(img => ({
          url: img.src,
          alt: img.alt || ''
        })),
        tags: Array.from(document.querySelectorAll('.tag-link')).map(t => t.innerText),
        views: document.querySelector('.view')?.innerText || '',
        duration: document.querySelector('.duration')?.innerText || ''
      };
    }
  },

  // 抖音
  douyin: {
    detect: () => window.location.hostname.includes('douyin.com'),
    extract: async () => {
      return {
        description: document.querySelector('[class*="description"]')?.innerText || '',
        author: document.querySelector('[class*="author"]')?.innerText || '',
        hashtags: Array.from(document.querySelectorAll('[class*="hashtag"]')).map(h => h.innerText),
        likes: document.querySelector('[class*="like"]')?.innerText || '',
        comments: document.querySelector('[class*="comment"]')?.innerText || '',
        shares: document.querySelector('[class*="share"]')?.innerText || ''
      };
    }
  },

  // 通用擔取
  generic: {
    detect: () => true,
    extract: async () => {
      return {
        title: ContentExtractor.extractTitle(),
        text: ContentExtractor.extractText(),
        markdown: await ContentExtractor.extractMarkdown(),
        images: ContentExtractor.extractImages(),
        url: window.location.href,
        description: ContentExtractor.extractDescription(),
        timestamp: new Date().toISOString()
      };
    }
  }
};

// 自动检测和提取
async function extractCurrentPageContent() {
  for (const [key, extractor] of Object.entries(PlatformExtractors)) {
    if (key !== 'generic' && extractor.detect()) {
      return await extractor.extract();
    }
  }
  // 默认使用通用提取器
  return await PlatformExtractors.generic.extract();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlatformExtractors, extractCurrentPageContent };
}

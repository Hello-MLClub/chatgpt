// 内容提取器 - 拓展和优化

class ContentExtractor {
  // 提取网页文本内容
  static extractText() {
    let text = '';
    const article = document.querySelector('article') || 
                   document.querySelector('[role="article"]') ||
                   document.querySelector('main') ||
                   document.body;
    
    // 简单的文本提取
    const paragraphs = article.querySelectorAll('p, div[class*="content"], div[class*="text"]');
    paragraphs.forEach(p => {
      text += p.innerText + '\n\n';
    });
    
    return text.trim();
  }

  // 提取标题
  static extractTitle() {
    const title = document.querySelector('h1') ||
                 document.querySelector('title') ||
                 document.querySelector('[class*="title"]');
    return title ? title.innerText : document.title;
  }

  // 提取摘要/描述
  static extractDescription() {
    const meta = document.querySelector('meta[name="description"]') ||
                document.querySelector('meta[property="og:description"]');
    return meta ? meta.getAttribute('content') : '';
  }

  // 提取所有图片
  static extractImages() {
    const images = [];
    const imgElements = document.querySelectorAll('img[src], img[data-src]');
    imgElements.forEach(img => {
      const src = img.src || img.dataset.src;
      if (src && !src.includes('data:')) {
        images.push({
          url: src,
          alt: img.alt || ''
        });
      }
    });
    return images;
  }

  // 提取网页框架结构为Markdown
  static extractMarkdown() {
    let markdown = '';
    
    // 标题
    const title = this.extractTitle();
    markdown += `# ${title}\n\n`;
    
    // 描述
    const desc = this.extractDescription();
    if (desc) {
      markdown += `> ${desc}\n\n`;
    }
    
    // 主要内容
    const article = document.querySelector('article') || 
                   document.querySelector('[role="article"]') ||
                   document.querySelector('main') ||
                   document.body;
    
    // 递归提取并转换为Markdown
    this._nodeToMarkdown(article, markdown);
    
    return markdown;
  }

  // 右转换DOM节点为Markdown
  static _nodeToMarkdown(node, markdown = '', depth = 0) {
    if (!node) return markdown;
    
    const maxDepth = 50; // 防止无限递归
    if (depth > maxDepth) return markdown;
    
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === 3) { // 文本节点
        const text = child.textContent.trim();
        if (text) markdown += text + ' ';
      } else if (child.nodeType === 1) { // 元素节点
        const tag = child.tagName.toLowerCase();
        
        switch (tag) {
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            const level = parseInt(tag[1]);
            markdown += '\n' + '#'.repeat(level + 1) + ' ' + child.innerText + '\n\n';
            break;
            
          case 'p':
            markdown += child.innerText + '\n\n';
            break;
            
          case 'strong':
          case 'b':
            markdown += '**' + child.innerText + '**';
            break;
            
          case 'em':
          case 'i':
            markdown += '*' + child.innerText + '*';
            break;
            
          case 'img':
            const alt = child.alt || '图片';
            const src = child.src || child.dataset.src;
            if (src) markdown += `![${alt}](${src})`;
            break;
            
          case 'a':
            const href = child.href;
            const linkText = child.innerText;
            if (href) markdown += `[${linkText}](${href})`;
            break;
            
          case 'ul':
            child.querySelectorAll('li').forEach(li => {
              markdown += '- ' + li.innerText + '\n';
            });
            markdown += '\n';
            break;
            
          case 'ol':
            child.querySelectorAll('li').forEach((li, i) => {
              markdown += `${i + 1}. ${li.innerText}\n`;
            });
            markdown += '\n';
            break;
            
          case 'code':
            markdown += '`' + child.innerText + '`';
            break;
            
          case 'pre':
            markdown += '\n```\n' + child.innerText + '\n```\n\n';
            break;
            
          case 'blockquote':
            markdown += '\n> ' + child.innerText.split('\n').join('\n> ') + '\n\n';
            break;
            
          default:
            // 递归处理其他元素
            if (child.children.length > 0) {
              markdown = this._nodeToMarkdown(child, markdown, depth + 1);
            } else if (child.innerText) {
              markdown += child.innerText + ' ';
            }
        }
      }
    });
    
    return markdown;
  }

  // 为Markdown添加中文支持
  static convertToMarkdown(html) {
    let markdown = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return this._nodeToMarkdown(doc.body, markdown);
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentExtractor;
}

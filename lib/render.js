const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const { marked } = require('marked');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Configure marked (GitHub-ish)
marked.setOptions({
  gfm: true,
  breaks: true
});

function renderMarkdown(md = '') {
  const raw = marked.parse(md || '');
  const clean = DOMPurify.sanitize(raw, {
    ALLOWED_ATTR: ['href','src','alt','title','class','id','width','height','target','rel'],
    ALLOWED_TAGS: [
      'a','abbr','b','blockquote','br','code','em','hr','i','img','li','ol','p',
      'pre','strong','ul','h1','h2','h3','h4','h5','h6','table','thead','tbody',
      'tr','td','th'
    ],
    ALLOW_DATA_ATTR: false,
    // allow relative /uploads/... and http(s):
    ALLOWED_URI_REGEXP: /^(?:(?:https?:)?\/\/|\/(?!\/))/i
  });
  return clean;
}

module.exports = { renderMarkdown };

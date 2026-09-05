const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// We want to replace the `.docs-devsite-article` and `.docs-content` rules
const regex = /\.docs-devsite-article h1[\s\S]*?(?=\/\* Tabular figures)/;

const newCss = `
  .docs-devsite-article h1,
  .docs-devsite-article h2,
  .docs-devsite-article h3,
  .docs-content h1,
  .docs-content h2,
  .docs-content h3 {
    font-family: var(--font-sans);
    color: #EDEDED;
    letter-spacing: -0.02em;
    font-weight: 600;
  }
  
  .docs-devsite-article h2,
  .docs-content h2 {
    font-size: 1.75rem;
    margin-top: 2.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .docs-devsite-article h3,
  .docs-content h3 {
    font-size: 1.25rem;
    font-weight: 500;
    margin-top: 2rem;
  }
  
  .docs-content p,
  .docs-content li {
    color: #A1A1AA;
    line-height: 1.7;
    margin-bottom: 1rem;
  }
  
  .docs-content a {
    color: #0066FF;
    text-decoration: none;
    transition: color 0.15s ease;
  }
  
  .docs-content a:hover {
    color: #00D2FF;
    text-decoration: underline;
  }
  
  .docs-content code {
    font-family: var(--font-mono);
    font-size: 0.85em;
    color: #00D2FF;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .docs-content pre {
    background: #050505 !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
    overflow-x: auto;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .docs-content pre code {
    color: inherit;
    background: transparent;
    padding: 0;
    border: none;
  }
  
  /* Inline Warning Callouts */
  .docs-content blockquote {
    border-left: 3px solid #FF9900;
    background: rgba(255, 153, 0, 0.05);
    padding: 1rem 1.25rem;
    margin: 1.5rem 0;
    border-radius: 0 8px 8px 0;
    color: #EDEDED;
  }
  .docs-content blockquote p {
    color: #EDEDED;
    margin-bottom: 0;
  }
}

`;

css = css.replace(regex, newCss);

fs.writeFileSync('src/index.css', css);

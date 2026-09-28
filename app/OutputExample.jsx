// Match the JSON token colors used by the website's docs code blocks.
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const highlightJson = (code) => escapeHtml(code).replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi, (match, stringToken, keySuffix, literalToken) => {
  if (stringToken && keySuffix) {
    return `<span class="docs-code-token-key">${stringToken}</span>${keySuffix}`;
  }

  if (stringToken) {
    return `<span class="docs-code-token-string">${stringToken}</span>`;
  }

  if (literalToken) {
    return `<span class="docs-code-token-literal">${literalToken}</span>`;
  }

  return `<span class="docs-code-token-number">${match}</span>`;
});

export default function OutputExample({ value }) {
  const code = JSON.stringify(value, null, 2);

  return <pre className="tool-output-example"><code dangerouslySetInnerHTML={{ __html: highlightJson(code) }} /></pre>;
}

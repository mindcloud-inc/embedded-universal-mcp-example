import { language as javascriptLanguage } from '@twinkleplop/javascript';

const highlight = javascriptLanguage();

export default function HighlightedCode({ code }) {
  return <code className="twinkleplop" dangerouslySetInnerHTML={{ __html: highlight(code, { structure: 'inline' }) }} />;
}

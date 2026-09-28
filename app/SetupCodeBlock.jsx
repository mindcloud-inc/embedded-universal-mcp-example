import { Fragment } from 'react';

export default function SetupCodeBlock({ lines }) {
  return (
    <pre className="setup-code"><code>
      {lines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {line.map(([value, tone], tokenIndex) => tone
            ? <span className={`setup-code-token-${tone}`} key={tokenIndex}>{value}</span>
            : <Fragment key={tokenIndex}>{value}</Fragment>)}
          {lineIndex < lines.length - 1 && '\n'}
        </Fragment>
      ))}
    </code></pre>
  );
}

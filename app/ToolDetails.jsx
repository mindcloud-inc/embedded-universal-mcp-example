import HighlightedCode from './HighlightedCode.jsx';
import OutputExample from './OutputExample.jsx';

export default function ToolDetails({ tool, outputExample }) {
  const required = new Set(tool.inputSchema.required || []);
  const fields = Object.entries(tool.inputSchema.properties || {});

  return (
    <div className="tool-detail-body">
      <div className="tool-reference-section">
        <h3>What the model sees</h3>
        <p className="tool-description">{tool.description}</p>
      </div>
      <div className="tool-reference-section">
        <h3>Input notation</h3>
        <p className="tool-reference-note">Required fields have no question mark. Optional fields end in ?.</p>
        <div className="tool-signature"><code>{`${tool.name}({${fields.map(([name]) => `${name}${required.has(name) ? '' : '?'}`).join(', ')}})`}</code></div>
        {fields.length > 0 && (
          <ul className="tool-fields">
            {fields.map(([name, field]) => (
              <li key={name}>
                <HighlightedCode code={`${name}${required.has(name) ? '' : '?'}`} />
                <span>{field.description || field.type || 'No description available'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="tool-reference-section">
        <h3>Output notation (example)</h3>
        {outputExample ? <OutputExample value={outputExample} /> : <p>Open a tool call in Chat to inspect its output.</p>}
      </div>
    </div>
  );
}

'use client';

import { useContext, useEffect } from 'react';
import { ToolboxIcon } from '@phosphor-icons/react/dist/ssr/Toolbox';
import { ToolSelectionContext } from './ToolSelectionContext.jsx';

export default function ToolBrowser({ groups, status, statusHelp }) {
  const { selectedTool, setSelectedTool } = useContext(ToolSelectionContext);
  const selected = groups.flatMap((group) => group.tools).find((tool) => tool.name === selectedTool);

  useEffect(() => {
    if (selectedTool && window.matchMedia('(max-width: 860px)').matches) {
      document.getElementById('tool-detail-panel')?.scrollIntoView({ block: 'start' });
    }
  }, [selectedTool]);

  return (
    <section className="tools-view" aria-label="Available tools">
      {status !== 'OK' ? (
        <div className="banner banner-error">{statusHelp}</div>
      ) : groups.length === 0 ? (
        <p className="tools-empty">The MCP server returned no tools for this API key.</p>
      ) : (
        <div className="tools-browser">
          <nav className="tool-menu" aria-label="Choose a tool">
            {groups.map((group) => (
              <section className="tool-menu-group" key={group.name} aria-label={group.name}>
                <h2>{group.name}</h2>
                <p>{group.hint}</p>
                <div className="tool-menu-options">
                  {group.tools.map((tool) => (
                    <button
                      key={tool.name}
                      type="button"
                      aria-controls="tool-detail-panel"
                      aria-pressed={selectedTool === tool.name}
                      className={`tool-menu-option${selectedTool === tool.name ? ' is-selected' : ''}`}
                      onClick={() => setSelectedTool(tool.name)}
                    >
                      {tool.name}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </nav>
          <section className="tool-detail-panel" id="tool-detail-panel" aria-label="Tool details">
            {selected ? (
              <>
                <header className="tool-detail-header">
                  <h2 id={`tool-detail-${selected.name}`} tabIndex={-1}>{selected.name}</h2>
                  <p>{selected.summary}</p>
                </header>
                {selected.details}
              </>
            ) : (
              <div className="tool-detail-empty">
                <span className="empty-state-icon" aria-hidden="true"><ToolboxIcon size={24} /></span>
                <h2>Select a tool</h2>
                <p>Choose a tool to see its description, inputs, and example output.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

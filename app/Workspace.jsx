'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import SetupGuide from './SetupGuide.jsx';
import { ToolSelectionContext } from './ToolSelectionContext.jsx';

const VIEWS = ['chat', 'tools', 'setup'];

export default function Workspace({ initialTab, chat, tools, toolNames, toolStatus, toolStatusHelp, statusPanels }) {
  const [activeView, setActiveView] = useState(VIEWS.includes(initialTab) ? initialTab : 'chat');
  const [selectedTool, setSelectedTool] = useState(null);
  const pendingShortcut = useRef(null);
  const tabsRef = useRef(null);
  const [indicator, setIndicator] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      const tab = new URLSearchParams(window.location.search).get('tab');
      setActiveView(VIEWS.includes(tab) ? tab : 'chat');
      pendingShortcut.current = null;
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const selectView = (view) => {
    if (view === activeView) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('tab', view);
    window.history.pushState(null, '', url);
    setActiveView(view);
  };

  useLayoutEffect(() => {
    const tabs = tabsRef.current;
    const activeButton = tabs?.querySelector('[aria-selected="true"]');
    if (!activeButton) {
      return;
    }

    const measure = () => {
      const styles = window.getComputedStyle(activeButton);
      const leftPadding = parseFloat(styles.paddingLeft) || 0;
      const rightPadding = parseFloat(styles.paddingRight) || 0;
      setIndicator({
        left: activeButton.offsetLeft + leftPadding,
        width: activeButton.offsetWidth - leftPadding - rightPadding,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(tabs);
    observer.observe(activeButton);
    return () => observer.disconnect();
  }, [activeView]);

  useEffect(() => {
    if (activeView !== 'tools' || !selectedTool || pendingShortcut.current !== selectedTool) {
      return;
    }

    pendingShortcut.current = null;
    document.getElementById(`tool-detail-${selectedTool}`)?.focus({ preventScroll: true });
  }, [activeView, selectedTool]);

  const openTool = (name) => {
    pendingShortcut.current = name;
    setSelectedTool(name);
    selectView('tools');
  };

  const openChat = () => {
    pendingShortcut.current = null;
    setSelectedTool(null);
    selectView('chat');
  };

  const handleTabKeyDown = (event) => {
    const currentIndex = VIEWS.indexOf(activeView);
    const nextView = event.key === 'Home' ? VIEWS[0]
      : event.key === 'End' ? VIEWS[VIEWS.length - 1]
        : event.key === 'ArrowRight' ? VIEWS[(currentIndex + 1) % VIEWS.length]
          : event.key === 'ArrowLeft' ? VIEWS[(currentIndex - 1 + VIEWS.length) % VIEWS.length] : null;
    if (!nextView) {
      return;
    }

    event.preventDefault();
    if (nextView === 'chat') {
      openChat();
    } else {
      selectView(nextView);
    }
    tabsRef.current?.querySelector(`#${nextView}-tab`)?.focus();
  };

  return (
    <>
      <nav className="view-tabs" role="tablist" aria-label="Demo views" ref={tabsRef} onKeyDown={handleTabKeyDown}>
        <button id="chat-tab" type="button" role="tab" aria-controls="chat-panel" aria-selected={activeView === 'chat'} tabIndex={activeView === 'chat' ? 0 : -1} className={activeView === 'chat' ? 'is-active' : ''} onClick={openChat}>Chat</button>
        <button id="tools-tab" type="button" role="tab" aria-controls="tools-panel" aria-selected={activeView === 'tools'} tabIndex={activeView === 'tools' ? 0 : -1} className={activeView === 'tools' ? 'is-active' : ''} onClick={() => selectView('tools')}>Tools</button>
        <button id="setup-tab" type="button" role="tab" aria-controls="setup-panel" aria-selected={activeView === 'setup'} tabIndex={activeView === 'setup' ? 0 : -1} className={activeView === 'setup' ? 'is-active' : ''} onClick={() => selectView('setup')}>Setup</button>
        {indicator && <span className="view-tabs-indicator" aria-hidden="true" style={{ transform: `translateX(${indicator.left}px)`, width: `${indicator.width}px` }} />}
      </nav>
      <div id="setup-panel" role="tabpanel" aria-labelledby="setup-tab" hidden={activeView !== 'setup'}>
        <SetupGuide />
      </div>
      <div id="chat-panel" role="tabpanel" aria-labelledby="chat-tab" hidden={activeView !== 'chat'}>
        <div className="layout">
          {chat}
          <aside className="status">
            <div className="status-card">
              <h2>Available tools</h2>
              {toolStatus === 'OK' ? (
                <>
                  <p className="status-hint">{toolNames.length === 0 ? 'Connected, but the MCP server returned no tools for this API key.' : 'The agent can call these tools right now.'}</p>
                  <ul className="tool-list">
                    {toolNames.map((name) => (
                      <li key={name}>
                        <button type="button" className="tool-link" onClick={() => openTool(name)} aria-label={`View ${name} in Tools`}>
                          <code>{name}</code>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p className="status-hint">{toolStatusHelp}</p>
                  <span className="chip chip-amber">{toolStatus}</span>
                </>
              )}
            </div>
            {statusPanels}
          </aside>
        </div>
      </div>
      <div id="tools-panel" role="tabpanel" aria-labelledby="tools-tab" hidden={activeView !== 'tools'}>
        <ToolSelectionContext.Provider value={{ selectedTool, setSelectedTool }}>
          {tools}
        </ToolSelectionContext.Provider>
      </div>
    </>
  );
}

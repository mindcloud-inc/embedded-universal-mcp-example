'use client';

// The chat UI. useChat posts the history to /api/chat and streams the answer
// back. The browser holds no keys and names no end user: everything that
// decides what the agent can do lives on the server.
import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SUGGESTIONS = ['Which apps can you work with?', 'What can I do with Slack?'];
const MARKDOWN_COMPONENTS = {
  table: ({ children }) => <div className="message-table"><table>{children}</table></div>,
  a: ({ href, children }) => href ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <span>{children}</span>,
  img: ({ alt }) => <span>{alt}</span>
};

// A MindCloud tool can succeed at the protocol level and still report an
// error: the result then has isError and a JSON error body in its text.
// A call the user stopped keeps its last state, so once its message stops
// streaming it shows as Stopped instead of Running forever.
const getToolLabel = ({ part, isLive }) => {
  if (part.state === 'output-available') {
    return part.output?.isError ? 'Error' : 'Done';
  }

  if (part.state === 'output-error') {
    return 'Failed';
  }

  if (!isLive) {
    return 'Stopped';
  }

  return part.state === 'input-streaming' ? 'Preparing' : 'Running';
};

const formatJson = (value) => {
  try {
    return JSON.stringify(typeof value === 'string' ? JSON.parse(value) : value, null, 2);
  } catch {
    return String(value);
  }
};

const formatToolOutput = (part) => {
  if (part.state === 'output-error') {
    return part.errorText;
  }

  const texts = (part.output?.content || []).filter((item) => item.type === 'text').map((item) => formatJson(item.text));
  return texts.length > 0 ? texts.join('\n\n') : formatJson(part.output);
};

const ToolCall = ({ part, isLive }) => {
  const label = getToolLabel({ part, isLive });
  const isFailure = label === 'Error' || label === 'Failed';
  const hasOutput = part.state === 'output-available' || part.state === 'output-error';

  return (
    <details className="tool-call">
      <summary>
        <svg className="tool-call-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="m4 6 6 6-6 6M13 18h7" />
        </svg>
        <span className="tool-call-name">{part.toolName.replaceAll('-', ' ')}</span>
        <span className={`tool-call-status ${isFailure ? 'is-error' : label === 'Done' ? 'is-done' : ''}`}>{label}</span>
        <svg className="tool-call-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </summary>
      <div className="tool-call-body">
        <div className="tool-call-label">Input</div>
        <pre className="code-block">{formatJson(part.input ?? {})}</pre>
        {hasOutput && (
          <>
            <div className="tool-call-label">Output</div>
            <pre className="code-block">{formatToolOutput(part)}</pre>
          </>
        )}
      </div>
    </details>
  );
};

export default function ChatClient({ canChat }) {
  const { messages, sendMessage, status, error, stop } = useChat();
  const [input, setInput] = useState('');
  const logRef = useRef(null);

  const isBusy = status === 'submitted' || status === 'streaming';

  // Keep the newest answer, tool rows, and errors in view as they stream in.
  useEffect(() => {
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, status]);

  const send = (text) => {
    const trimmed = text.trim();

    if (!trimmed || isBusy || !canChat) {
      return;
    }

    sendMessage({ text: trimmed });
    setInput('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send(input);
  };

  return (
    <section className="chat" aria-label="Chat with MindCloud">
      <div className="chat-log" ref={logRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <span className="empty-state-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                <path d="M227.32,48.75A8,8,0,0,0,218.76,50c-28,24.22-51.72,12.48-79.21-1.13C111.07,34.76,78.78,18.79,42.76,50A8,8,0,0,0,40,56V224a8,8,0,0,0,16,0V179.77c26.79-21.16,49.87-9.75,76.45,3.41,28.49,14.09,60.77,30.06,96.79-1.13a8,8,0,0,0,2.76-6V56A8,8,0,0,0,227.32,48.75ZM216,71.6v40.65c-14,11.06-27,13.22-40,10.88V79.34A60.05,60.05,0,0,0,216,71.6Zm-56,3.76v43c-6.66-2.67-13.43-6-20.45-9.48-8.82-4.37-18-8.91-27.55-12.18v-43c6.66,2.66,13.43,6,20.45,9.48C141.27,67.55,150.46,72.09,160,75.36ZM96,48.91V92.69a60.06,60.06,0,0,0-40,7.75V59.78C70,48.72,83,46.57,96,48.91ZM86.58,152A60.06,60.06,0,0,0,56,160.43V119.78c14-11.06,27-13.22,40-10.88v43.8A65.61,65.61,0,0,0,86.58,152ZM112,156.67v-43c6.66,2.66,13.43,6,20.45,9.48,8.82,4.37,18,8.9,27.55,12.17v43c-6.66-2.67-13.43-6-20.45-9.48C130.73,164.47,121.54,159.94,112,156.67Zm64,26.45v-43.8a65.61,65.61,0,0,0,9.42.72A60.11,60.11,0,0,0,216,131.57v40.68C202,183.31,189,185.46,176,183.12Z" />
              </svg>
            </span>
            <h2>What would you like to do?</h2>
            <p>Find an app, connect an account, or get something done.</p>
            <div className="chat-suggestions">
              {SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} type="button" className="chat-suggestion" onClick={() => send(suggestion)} disabled={!canChat}>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, messageIndex) => (
          <div key={message.id} className={`message message-${message.role}`}>
            {message.parts.map((part, index) => {
              if (part.type === 'text') {
                const text = part.text.trim();
                if (!text) {
                  return null;
                }

                return (
                  <div key={index} className="message-text">
                    <Markdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS} skipHtml>{text}</Markdown>
                  </div>
                );
              }

              // MCP tools arrive as dynamic tool parts: their schemas come from
              // the MCP server at run time, not from this codebase.
              if (part.type === 'dynamic-tool') {
                return <ToolCall key={part.toolCallId} part={part} isLive={isBusy && messageIndex === messages.length - 1} />;
              }

              return null;
            })}
          </div>
        ))}

        {status === 'submitted' && <div className="message message-assistant message-pending">Thinking</div>}

        {error && <div className="banner banner-error">{error.message}</div>}
      </div>

      <div className="chat-composer">
        <form className="chat-form" onSubmit={handleSubmit}>
          <textarea
            rows={2}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                send(input);
              }
            }}
            placeholder={canChat ? 'Ask anything about your apps…' : 'Set AI_GATEWAY_API_KEY to start chatting'}
            disabled={!canChat}
            aria-label="Message"
          />
          <div className="chat-composer-actions">
            {isBusy ? (
              <button type="button" className="chat-send" onClick={stop} aria-label="Stop" title="Stop">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button type="submit" className="chat-send" disabled={!canChat || !input.trim()} aria-label="Send" title="Send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19V5m-6 6 6-6 6 6" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

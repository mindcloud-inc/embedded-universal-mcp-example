'use client';

import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { slotText } from 'slot-text';
import 'slot-text/style.css';
import SetupCodeBlock from './SetupCodeBlock.jsx';
import { SETUP_INSTRUCTIONS_MARKDOWN, SETUP_STEPS } from './setupInstructions.js';

const COPY_WORD = 'Copy';
const COPIED_WORD = 'Copied';
const LABEL_SUFFIX = ' these instructions for your AI agent';
const COPY_LABEL = `${COPY_WORD}${LABEL_SUFFIX}`;
const COPIED_LABEL = `${COPIED_WORD}${LABEL_SUFFIX}`;

export default function SetupGuide() {
  const [copyState, setCopyState] = useState('idle');
  const labelRef = useRef(null);
  const slotRef = useRef(null);
  const resetTimerRef = useRef(null);

  useEffect(() => {
    slotRef.current = slotText(labelRef.current, COPY_WORD, { rollBy: 'character', duration: 220, stagger: 20 });

    return () => {
      window.clearTimeout(resetTimerRef.current);
      slotRef.current.destroy();
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SETUP_INSTRUCTIONS_MARKDOWN);
    } catch {
      slotRef.current?.set(COPY_WORD);
      window.clearTimeout(resetTimerRef.current);
      setCopyState('failed');
      return;
    }

    slotRef.current?.flash(COPIED_WORD, {
      revertAfter: 1800,
      enter: { direction: 'up' },
      exit: { direction: 'down' },
    });
    setCopyState('copied');
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setCopyState('idle'), 1800);
  };

  return (
    <div className="setup-guide">
      <ol className="setup-steps">
        {SETUP_STEPS.map((step, index) => (
          <li className="setup-step" key={step.title}>
            <span className="setup-step-number" aria-hidden="true">{index + 1}</span>
            <div className="setup-step-content">
              <h3>{step.title}</h3>
              {step.paragraphs.map((paragraph) => <Markdown key={paragraph} skipHtml>{paragraph}</Markdown>)}
              {step.snippetLines && <SetupCodeBlock lines={step.snippetLines} />}
              {step.link && <a href={step.link.href} target="_blank" rel="noopener noreferrer">{step.link.label} <span aria-hidden="true">↗</span></a>}
            </div>
          </li>
        ))}
      </ol>
      <div className="setup-copy">
        <button type="button" onClick={handleCopy} aria-label={copyState === 'copied' ? COPIED_LABEL : COPY_LABEL}>
          <span ref={labelRef} aria-hidden="true">{COPY_WORD}</span>{LABEL_SUFFIX}
        </button>
        {copyState === 'failed' && <span className="setup-copy-error" role="status">Copy failed. Try again.</span>}
      </div>
    </div>
  );
}

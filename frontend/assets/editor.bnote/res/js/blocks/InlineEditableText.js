import React, { useState, useRef, useEffect } from 'react';

/**
 * Props:
 * - value: string (initial value to show)
 * - onCommit: function (called with new value on Enter or blur)
 * - className: optional class for the wrapper
 * - inputStyle: optional inline styles for the input
 * - renderDisplay: optional function to render non-editing display
 */
export function InlineEditableText({
                                       value='',
                                       onCommit=(v)=>{},
                                       className = '',
                                       inputStyle = {},
                                       renderDisplay,
                                   }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    const commit = () => {
        setEditing(false);
        const trimmed = text.trim();
        if (trimmed !== value) {
            onCommit?.(trimmed);
        }
    };

    const cancel = () => {
        setEditing(false);
        setText(value); // revert
    };

    return (
        <span className={className}>
      {editing ? (
          <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                  if (e.key === 'Enter') commit();
                  else if (e.key === 'Escape') cancel();
              }}
              style={{
                  font: 'inherit',
                  padding: 0,
                  margin: 0,
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  ...inputStyle,
              }}
          />
      ) : (
          <span
              tabIndex={0}
              role="button"
              onClick={() => setEditing(true)}
              onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditing(true);
              }}
              style={{ cursor: 'text' }}
          >
          {renderDisplay ? renderDisplay(value) : value}
        </span>
      )}
    </span>
    );
}
